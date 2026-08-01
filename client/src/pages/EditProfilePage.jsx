import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { updateProfile } from "../lib/api";
import { getAvatarSrc, getDefaultAvatar } from "../lib/avatar";
import { LoaderIcon, MapPinIcon, SaveIcon, ShuffleIcon, UploadIcon } from "lucide-react";
import { LANGUAGES } from "../constants";

const GENDERS = [
  { value: "", label: "Prefer not to say" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const EditProfilePage = () => {
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formState, setFormState] = useState({
    fullName: "",
    bio: "",
    nativeLanguage: "",
    learningLanguage: "",
    country: "",
    city: "",
    gender: "",
    profilePic: "",
  });
  const [avatarKey, setAvatarKey] = useState(0);
  const [previewSrc, setPreviewSrc] = useState("");

  useEffect(() => {
    if (!authUser) return;
    setFormState({
      fullName: authUser.fullName || "",
      bio: authUser.bio || "",
      nativeLanguage: authUser.nativeLanguage || "",
      learningLanguage: authUser.learningLanguage || "",
      country: authUser.country || "",
      city: authUser.city || "",
      gender: authUser.gender || "",
      profilePic: authUser.profilePic || "",
    });
    setPreviewSrc(getAvatarSrc(authUser));
  }, [authUser]);

  const { mutate: updateMutation, isPending } = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formState.country.trim()) {
      toast.error("Country is required");
      return;
    }

    const payload = {
      ...formState,
      profilePic: formState.profilePic || getDefaultAvatar(authUser?._id || formState.fullName),
    };
    updateMutation(payload);
  };

  const handleRandomAvatar = () => {
    const seed = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const randomAvatar = getDefaultAvatar(seed);
    setFormState((prev) => ({ ...prev, profilePic: randomAvatar }));
    setPreviewSrc(randomAvatar);
    setAvatarKey((k) => k + 1);
    toast.success("Random profile picture generated!");
  };

  const resizeImage = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const maxSize = 256;
          let { width, height } = img;
          if (width > height && width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        };
        img.onerror = () => reject(new Error("Could not load image"));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error("Could not read file"));
      reader.readAsDataURL(file);
    });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }

    try {
      const dataUrl = await resizeImage(file);
      setFormState((prev) => ({ ...prev, profilePic: dataUrl }));
      setPreviewSrc(dataUrl);
      setAvatarKey((k) => k + 1);
      toast.success("Profile picture uploaded!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-3xl">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-center mb-6">Edit Profile</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="size-32 rounded-full bg-base-300 overflow-hidden border border-base-content/10">
                  <img
                    key={avatarKey}
                    src={previewSrc || getDefaultAvatar(authUser?._id || "streamify-user")}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                    onError={() =>
                      setPreviewSrc(getDefaultAvatar(authUser?._id || "streamify-user"))
                    }
                  />
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button type="button" onClick={handleRandomAvatar} className="btn btn-accent">
                    <ShuffleIcon className="size-4 mr-2" />
                    Generate Random Avatar
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="btn btn-outline"
                  >
                    <UploadIcon className="size-4 mr-2" />
                    Upload Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Full Name</span>
                </label>
                <input
                  type="text"
                  value={formState.fullName}
                  onChange={(e) => setFormState({ ...formState, fullName: e.target.value })}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">Bio</span>
                </label>
                <textarea
                  value={formState.bio}
                  onChange={(e) => setFormState({ ...formState, bio: e.target.value })}
                  className="textarea textarea-bordered h-24"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text">
                    Gender <span className="opacity-60">(optional)</span>
                  </span>
                </label>
                <select
                  value={formState.gender}
                  onChange={(e) => setFormState({ ...formState, gender: e.target.value })}
                  className="select select-bordered w-full"
                >
                  {GENDERS.map((g) => (
                    <option key={g.value || "none"} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Native Language</span>
                  </label>
                  <select
                    value={formState.nativeLanguage}
                    onChange={(e) =>
                      setFormState({ ...formState, nativeLanguage: e.target.value })
                    }
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Select your native language</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`native-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Learning Language</span>
                  </label>
                  <select
                    value={formState.learningLanguage}
                    onChange={(e) =>
                      setFormState({ ...formState, learningLanguage: e.target.value })
                    }
                    className="select select-bordered w-full"
                    required
                  >
                    <option value="">Select language you're learning</option>
                    {LANGUAGES.map((lang) => (
                      <option key={`learning-${lang}`} value={lang.toLowerCase()}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      Country <span className="text-error">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <MapPinIcon className="absolute top-1/2 -translate-y-1/2 left-3 size-5 opacity-70" />
                    <input
                      type="text"
                      value={formState.country}
                      onChange={(e) => setFormState({ ...formState, country: e.target.value })}
                      className="input input-bordered w-full pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      City <span className="opacity-60">(optional)</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formState.city}
                    onChange={(e) => setFormState({ ...formState, city: e.target.value })}
                    className="input input-bordered w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="btn btn-ghost flex-1"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary flex-1" disabled={isPending} type="submit">
                  {!isPending ? (
                    <>
                      <SaveIcon className="size-5 mr-2" />
                      Save Changes
                    </>
                  ) : (
                    <>
                      <LoaderIcon className="animate-spin size-5 mr-2" />
                      Saving...
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
