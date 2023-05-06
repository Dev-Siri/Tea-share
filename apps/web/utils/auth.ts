import type { GoogleAuthHandler, LoginHandler, LogoutHandler, SignupHandler, UpdateProfileHandler } from "@/types";

export const Signup: SignupHandler = async (username, image, email, password) => {
  const { createUserWithEmailAndPassword, updateProfile, getIdToken } = await import("firebase/auth");
  const { getDownloadURL, ref, uploadBytes } = await import("firebase/storage");
  const { storage, auth } = await import("@/services/firebase");
  const { createUser } = await import("@/services/fetchers");
  const { toast } = await import("react-hot-toast");
  const { setCookie } = await import("./cookies");

  if (!username || !image) return toast.error("All the fields were not provided for sign up.") as unknown as void;

  const loading = toast.loading("Creating your account...");

  try {
    const imageName = crypto.randomUUID();

    const imageRef = ref(storage, `users/${imageName}`);

    await uploadBytes(imageRef, image);

    const imageLink = await getDownloadURL(imageRef);

    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, {
      displayName: username,
      photoURL: imageLink,
    });
    await createUser({
      username,
      image: imageLink,
      email,
    });

    const authToken = await getIdToken(user);

    setCookie("auth_token", authToken);
  } catch (error: any) {
    const { mailAuthErrorFormater } = await import("./errors");
    const errorMessage = mailAuthErrorFormater(error.message);

    toast.remove(loading);
    toast.error(`Failed to create your account, ${errorMessage}`);
  }
};

export const Login: LoginHandler = async (email, password) => {
  const { signInWithEmailAndPassword, getIdToken } = await import("firebase/auth");
  const { toast } = await import("react-hot-toast");
  const { setCookie } = await import("./cookies");
  const { auth } = await import("@/services/firebase");

  const loading = toast.loading("Logging you in...");

  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);

    const authToken = await getIdToken(user);

    setCookie("auth_token", authToken);
  } catch (error: any) {
    const { mailAuthErrorFormater } = await import("./errors");
    const errorMessage = mailAuthErrorFormater(error.message);

    toast.remove(loading);
    toast.error(`Failed to login, ${errorMessage}`);
  }
};

export const GoogleAuth: GoogleAuthHandler = async () => {
  const { signInWithPopup, getIdToken, GoogleAuthProvider } = await import("firebase/auth");
  const { createUser } = await import("@/services/fetchers");
  const { toast } = await import("react-hot-toast");
  const { setCookie } = await import("./cookies");
  const { auth } = await import("@/services/firebase");

  const loading = toast.loading("Logging you in...");

  try {
    const provider = new GoogleAuthProvider();

    const { user } = await signInWithPopup(auth, provider);

    await createUser({
      email: user.email!,
      username: user.displayName!,
      image: user.photoURL!,
    });

    const authToken = await getIdToken(user);

    setCookie("auth_token", authToken);
  } catch (error: any) {
    const { googleAuthErrorFormater } = await import("./errors");
    const errorMessage = googleAuthErrorFormater(error.message);

    toast.remove(loading);
    toast.error(`Could not sign in with Google, ${errorMessage}`);
  }
};

export const Logout: LogoutHandler = async () => {
  const { removeCookie } = await import("./cookies");
  const { toast } = await import("react-hot-toast");
  const { auth } = await import("@/services/firebase");

  const loading = toast.loading("Logging you out...");

  try {
    await auth.signOut();
    removeCookie("auth_token");
  } catch (error: any) {
    toast.remove(loading);
    toast.error(`Failed to log you out, ${error.message}`);
  }
};

export const UpdateProfile: UpdateProfileHandler = async (email, username, image, id) => {
  const { updateEmail, updateProfile, getIdToken } = await import("firebase/auth");
  const { getDownloadURL, ref, uploadBytes } = await import("firebase/storage");
  const { updateProfile: updateProfileAPI } = await import("@/services/fetchers");
  const { storage, auth } = await import("@/services/firebase");
  const { toast } = await import("react-hot-toast");
  const { setCookie } = await import("./cookies");

  try {
    const imageName = crypto.randomUUID();
    const imageRef = ref(storage, `users/${imageName}`);

    await uploadBytes(imageRef, image as File);

    const uploadedImage = await getDownloadURL(imageRef);

    toast.loading("Updating your profile...", { id: "update-profile" });
    await updateProfile(auth.currentUser!, {
      displayName: username,
      photoURL: uploadedImage,
    });

    await updateEmail(auth.currentUser!, email);

    await updateProfileAPI(id, { _id: id, image: uploadedImage, username, email });

    const authToken = await getIdToken(auth.currentUser!);

    setCookie("auth_token", authToken);

    toast.remove("update-profile");
    toast.success("Successfully updated your profile.");
    location.reload();
  } catch (error: any) {
    toast.error(`Failed to update your profile, ${error.message}`);
  }
};
