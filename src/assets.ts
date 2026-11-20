/**
 * Catálogo central de assets descargados de Figma (assets/figma).
 * Los SVG se importan como componentes gracias a react-native-svg-transformer.
 */
import DotAmber from '@assets/figma/dot-amber.svg';
import DotAmber7 from '@assets/figma/dot-amber-7.svg';
import DotGreen from '@assets/figma/dot-green.svg';
import DotGreen7 from '@assets/figma/dot-green-7.svg';
import DotRed from '@assets/figma/dot-red.svg';
import DotRed7 from '@assets/figma/dot-red-7.svg';
import IconArrow from '@assets/figma/icon-arrow.svg';
import IconBack from '@assets/figma/icon-back.svg';
import IconBackWhite from '@assets/figma/icon-back-white.svg';
import IconBackCompact from '@assets/figma/icon-back-compact.svg';
import IconBellNotification from '@assets/figma/icon-bell-notification.svg';
import BadgeDot from '@assets/figma/badge-dot.svg';
import IconBellActive from '@assets/figma/icon-bell-active.svg';
import IconBellInactive from '@assets/figma/icon-bell-inactive.svg';
import IconCamera from '@assets/figma/icon-camera.svg';
import IconCheck15 from '@assets/figma/icon-check-15.svg';
import IconCheck18 from '@assets/figma/icon-check-18.svg';
import IconCheck20 from '@assets/figma/icon-check-20.svg';
import IconCheck22 from '@assets/figma/icon-check-22.svg';
import IconChevronRight from '@assets/figma/icon-chevron-right.svg';
import IconChip from '@assets/figma/icon-chip.svg';
import IconChipInactive from '@assets/figma/icon-chip-inactive.svg';
import IconDrop14 from '@assets/figma/icon-drop-14.svg';
import IconDrop18 from '@assets/figma/icon-drop-18.svg';
import IconDrop19 from '@assets/figma/icon-drop-19.svg';
import IconDrop22 from '@assets/figma/icon-drop-22.svg';
import IconDropAmber from '@assets/figma/icon-drop-amber.svg';
import IconDropLight from '@assets/figma/icon-drop-light.svg';
import IconEdit from '@assets/figma/icon-edit.svg';
import IconEyeMuted from '@assets/figma/icon-eye-muted.svg';
import IconFlash from '@assets/figma/icon-flash.svg';
import IconHumidity22 from '@assets/figma/icon-humidity-22.svg';
import IconLeaf from '@assets/figma/icon-leaf.svg';
import IconLeaf22 from '@assets/figma/icon-leaf-22.svg';
import IconLeafAmber from '@assets/figma/icon-leaf-amber.svg';
import IconLeafInactive from '@assets/figma/icon-leaf-inactive.svg';
import IconLeafLight from '@assets/figma/icon-leaf-light.svg';
import IconLockMuted from '@assets/figma/icon-lock-muted.svg';
import IconLockSmall from '@assets/figma/icon-lock-small.svg';
import IconMailMuted from '@assets/figma/icon-mail-muted.svg';
import IconPlus from '@assets/figma/icon-plus.svg';
import IconReconnect from '@assets/figma/icon-reconnect.svg';
import IconRotate from '@assets/figma/icon-rotate.svg';
import IconSun14 from '@assets/figma/icon-sun-14.svg';
import IconSun18 from '@assets/figma/icon-sun-18.svg';
import IconSun22 from '@assets/figma/icon-sun-22.svg';
import IconSunLight from '@assets/figma/icon-sun-light.svg';
import IconTemp14 from '@assets/figma/icon-temp-14.svg';
import IconTemp18 from '@assets/figma/icon-temp-18.svg';
import IconTemp22 from '@assets/figma/icon-temp-22.svg';
import IconWifiOff from '@assets/figma/icon-wifi-off.svg';
import IconWifiOffRed from '@assets/figma/icon-wifi-off-red.svg';
import LogoLeaf from '@assets/figma/logo-leaf.svg';
import QrFrame from '@assets/figma/qr-frame.svg';
import QrModule from '@assets/figma/qr-module.svg';
import ScanGrid from '@assets/figma/scan-grid.svg';
import ScanShutterRing from '@assets/figma/scan-shutter-ring.svg';
import WelcomeLine3 from '@assets/figma/welcome-line3.svg';
import WelcomeLine4 from '@assets/figma/welcome-line4.svg';
import WelcomeLine5 from '@assets/figma/welcome-line5.svg';

export const Icons = {
  arrow: IconArrow,
  back: IconBack,
  backWhite: IconBackWhite,
  backCompact: IconBackCompact,
  bellNotification: IconBellNotification,
  badgeDot: BadgeDot,
  bellActive: IconBellActive,
  bellInactive: IconBellInactive,
  camera: IconCamera,
  check15: IconCheck15,
  check18: IconCheck18,
  check20: IconCheck20,
  check22: IconCheck22,
  chevronRight: IconChevronRight,
  chip: IconChip,
  chipInactive: IconChipInactive,
  drop14: IconDrop14,
  drop18: IconDrop18,
  drop19: IconDrop19,
  drop22: IconDrop22,
  dropAmber: IconDropAmber,
  dropLight: IconDropLight,
  edit: IconEdit,
  eyeMuted: IconEyeMuted,
  flash: IconFlash,
  humidity22: IconHumidity22,
  leaf: IconLeaf,
  leaf22: IconLeaf22,
  leafAmber: IconLeafAmber,
  leafInactive: IconLeafInactive,
  leafLight: IconLeafLight,
  lockMuted: IconLockMuted,
  lockSmall: IconLockSmall,
  mailMuted: IconMailMuted,
  plus: IconPlus,
  reconnect: IconReconnect,
  rotate: IconRotate,
  sun14: IconSun14,
  sun18: IconSun18,
  sun22: IconSun22,
  sunLight: IconSunLight,
  temp14: IconTemp14,
  temp18: IconTemp18,
  temp22: IconTemp22,
  wifiOff: IconWifiOff,
  wifiOffRed: IconWifiOffRed,
} as const;

export const Dots = {
  ok: DotGreen,
  warn: DotAmber,
  danger: DotRed,
  ok7: DotGreen7,
  warn7: DotAmber7,
  danger7: DotRed7,
} as const;

export const Graphics = {
  logoLeaf: LogoLeaf,
  qrFrame: QrFrame,
  qrModule: QrModule,
  scanGrid: ScanGrid,
  scanShutterRing: ScanShutterRing,
  welcomeLine3: WelcomeLine3,
  welcomeLine4: WelcomeLine4,
  welcomeLine5: WelcomeLine5,
} as const;

export const Images = {
  welcomeBg: require('@assets/figma/welcome-bg.png'),
  loginBg: require('@assets/figma/login-bg.png'),
  scanGallery: require('@assets/figma/scan-gallery.png'),
  leafHero: require('@assets/figma/detail-leaf-hero.jpg'),
  leafOld: require('@assets/figma/leaf-history-old.jpg'),
  plantMonstera: require('@assets/figma/plant-monstera.jpg'),
  plantMenta: require('@assets/figma/plant-menta.jpg'),
  plantSansevieria: require('@assets/figma/plant-sansevieria.jpg'),
} as const;

export type ImageKey = keyof typeof Images;
