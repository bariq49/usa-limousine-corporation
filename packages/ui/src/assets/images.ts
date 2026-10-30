import authDark from "../../public/assets/images/auth/auth-dark.png";
import authLight from "../../public/assets/images/auth/auth-light.png";
import authMobile from "../../public/assets/images/auth/auth-mobile.jpg";
import userAvatar from "../../public/assets/images/avatar/user.png";
import darkLogo from "../../public/assets/images/logo/dark-logo.png";
import whiteLogo from "../../public/assets/images/logo/white-logo.png";
import carMarker from "../../public/assets/images/map/car-marker.png";
import profileCover from "../../public/assets/images/profile/cover.png";

export const ASSETS = {
  auth: { dark: authDark, light: authLight, mobile: authMobile },
  avatar: { user: userAvatar },
  logo: { dark: darkLogo, white: whiteLogo },
  map: { carMarker },
  profile: { cover: profileCover },
} as const;
