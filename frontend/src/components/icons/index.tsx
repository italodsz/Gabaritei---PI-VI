import { forwardRef, type ComponentPropsWithoutRef, type ForwardRefExoticComponent, type RefAttributes } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  AccessibilityIcon,
  AiMagicIcon,
  Alert02Icon,
  AlertCircleIcon,
  Analytics01Icon,
  ArrowDown01Icon,
  ArrowDown02Icon,
  ArrowLeft01Icon,
  ArrowLeft02Icon,
  ArrowRight01Icon,
  ArrowRight02Icon,
  ArrowTurnBackwardIcon,
  ArrowUp02Icon,
  ArrowUpRight01Icon,
  Atom01Icon,
  Award05Icon,
  BankIcon,
  Bookmark02Icon,
  BookmarkCheck02Icon,
  BookOpen01Icon,
  Brain02Icon,
  BulbIcon,
  Calendar01Icon,
  Calendar03Icon,
  Calendar04Icon,
  Cancel01Icon,
  CancelCircleIcon,
  CenterFocusIcon,
  ChampionIcon,
  ChartDecreaseIcon,
  ChartHistogramIcon,
  ChartIncreaseIcon,
  CheckListIcon,
  CheckmarkCircle02Icon,
  CircleDashedIcon,
  Clock01Icon,
  Compass01Icon,
  ComputerIcon,
  DashboardSpeed01Icon,
  Database02Icon,
  Delete02Icon,
  EraserIcon,
  FileQuestionMarkIcon,
  FilterHorizontalIcon,
  FireIcon,
  Flag02Icon,
  FlashIcon,
  FloppyDiskIcon,
  FootprintsIcon,
  FullScreenIcon,
  Globe02Icon,
  HandCoinsIcon,
  Home01Icon,
  HourglassIcon,
  InformationCircleIcon,
  Layers01Icon,
  Leaf01Icon,
  LeftToRightListNumberIcon,
  LibraryIcon,
  Loading03Icon,
  Location01Icon,
  Logout01Icon,
  MagicWand01Icon,
  Mail01Icon,
  MailQuestionMarkIcon,
  Medal01Icon,
  MinusSignIcon,
  Moon02Icon,
  Mortarboard02Icon,
  MountainIcon,
  NextIcon,
  NoteEditIcon,
  PaintBoardIcon,
  PauseIcon,
  PencilEdit01Icon,
  PlayIcon,
  PlusSignIcon,
  QuillWrite01Icon,
  RefreshIcon,
  RepeatIcon,
  SchoolIcon,
  Scroll01Icon,
  Search01Icon,
  SentIcon,
  Settings02Icon,
  ShuffleIcon,
  SidebarRight01Icon,
  SidebarRightIcon,
  SigmaIcon,
  SlidersHorizontalIcon,
  SquareLock02Icon,
  StarIcon,
  Sun03Icon,
  Target01Icon,
  Target02Icon,
  TaskDone01Icon,
  TaskDone02Icon,
  Telescope01Icon,
  TestTube01Icon,
  ThumbsUpIcon,
  Tick02Icon,
  TimeQuarterPassIcon,
  Timer01Icon,
  TranslateIcon,
  Undo02Icon,
  UserAdd01Icon,
  UserGroupIcon,
  UserIcon,
  ViewIcon,
  ViewOffSlashIcon,
} from "@hugeicons/core-free-icons";

/**
 * Ícones do Gabaritei (Hugeicons, traço arredondado).
 * Ponto único de troca: o app importa daqui, nunca direto da biblioteca.
 */
export type IconProps = Omit<ComponentPropsWithoutRef<"svg">, "strokeWidth"> & {
  size?: number | string;
  strokeWidth?: number;
};
export type Icon = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

function icon(svg: IconSvgElement, name: string): Icon {
  const Component = forwardRef<SVGSVGElement, IconProps>(({ strokeWidth = 1.75, ...props }, ref) => (
    <HugeiconsIcon
      ref={ref}
      icon={svg}
      strokeWidth={strokeWidth}
      aria-hidden={props["aria-label"] ? undefined : true}
      focusable={false}
      {...props}
    />
  ));
  Component.displayName = name;
  return Component;
}

// Navegação
export const House = icon(Home01Icon, "House");
export const BookOpenCheck = icon(TaskDone01Icon, "BookOpenCheck");
export const Timer = icon(Timer01Icon, "Timer");
export const History = icon(TimeQuarterPassIcon, "History");
export const ChartNoAxesCombined = icon(Analytics01Icon, "ChartNoAxesCombined");

// Ações
export const Search = icon(Search01Icon, "Search");
export const Plus = icon(PlusSignIcon, "Plus");
export const Minus = icon(MinusSignIcon, "Minus");
export const Play = icon(PlayIcon, "Play");
export const Pencil = icon(PencilEdit01Icon, "Pencil");
export const Save = icon(FloppyDiskIcon, "Save");
export const Trash2 = icon(Delete02Icon, "Trash2");
export const RefreshCcw = icon(RefreshIcon, "RefreshCcw");
export const RotateCcw = icon(Undo02Icon, "RotateCcw");
export const ListRestart = icon(RepeatIcon, "ListRestart");
export const Expand = icon(FullScreenIcon, "Expand");
export const Eye = icon(ViewIcon, "Eye");
export const EyeOff = icon(ViewOffSlashIcon, "EyeOff");
export const LogOut = icon(Logout01Icon, "LogOut");
export const UserPlus = icon(UserAdd01Icon, "UserPlus");
export const Sparkles = icon(AiMagicIcon, "Sparkles");
export const Loader2 = icon(Loading03Icon, "Loader2");

// Setas
export const ArrowLeft = icon(ArrowLeft02Icon, "ArrowLeft");
export const ArrowRight = icon(ArrowRight02Icon, "ArrowRight");
export const ArrowUp = icon(ArrowUp02Icon, "ArrowUp");
export const ArrowDown = icon(ArrowDown02Icon, "ArrowDown");
export const ChevronLeft = icon(ArrowLeft01Icon, "ChevronLeft");
export const ChevronRight = icon(ArrowRight01Icon, "ChevronRight");
export const ChevronDown = icon(ArrowDown01Icon, "ChevronDown");
export const CornerDownLeft = icon(ArrowTurnBackwardIcon, "CornerDownLeft");

// Estado e feedback
export const Check = icon(Tick02Icon, "Check");
export const CheckCircle2 = icon(CheckmarkCircle02Icon, "CheckCircle2");
export const X = icon(Cancel01Icon, "X");
export const XCircle = icon(CancelCircleIcon, "XCircle");
export const CircleAlert = icon(AlertCircleIcon, "CircleAlert");
export const CircleDashed = icon(CircleDashedIcon, "CircleDashed");
export const Info = icon(InformationCircleIcon, "Info");
export const Lock = icon(SquareLock02Icon, "Lock");
export const ThumbsUp = icon(ThumbsUpIcon, "ThumbsUp");
export const Lightbulb = icon(BulbIcon, "Lightbulb");

// Estudo e progresso
export const Target = icon(Target02Icon, "Target");
export const Flame = icon(FireIcon, "Flame");
export const Trophy = icon(ChampionIcon, "Trophy");
export const Award = icon(Award05Icon, "Award");
export const Medal = icon(Medal01Icon, "Medal");
export const Zap = icon(FlashIcon, "Zap");
export const Gauge = icon(DashboardSpeed01Icon, "Gauge");
export const BarChart3 = icon(ChartHistogramIcon, "BarChart3");
export const TrendingUp = icon(ChartIncreaseIcon, "TrendingUp");
export const TrendingDown = icon(ChartDecreaseIcon, "TrendingDown");
export const Clock = icon(Clock01Icon, "Clock");
export const CalendarDays = icon(Calendar03Icon, "CalendarDays");
export const ListChecks = icon(CheckListIcon, "ListChecks");
export const ClipboardCheck = icon(TaskDone02Icon, "ClipboardCheck");
export const NotebookPen = icon(NoteEditIcon, "NotebookPen");
export const FileQuestion = icon(FileQuestionMarkIcon, "FileQuestion");
export const GraduationCap = icon(Mortarboard02Icon, "GraduationCap");
export const School = icon(SchoolIcon, "School");
export const Telescope = icon(Telescope01Icon, "Telescope");
export const HandCoins = icon(HandCoinsIcon, "HandCoins");

// Conta e preferências
export const User = icon(UserIcon, "User");
export const Settings = icon(Settings02Icon, "Settings");
export const Mail = icon(Mail01Icon, "Mail");
export const MailQuestion = icon(MailQuestionMarkIcon, "MailQuestion");
export const MapPin = icon(Location01Icon, "MapPin");
export const Sun = icon(Sun03Icon, "Sun");
export const Moon = icon(Moon02Icon, "Moon");
export const Monitor = icon(ComputerIcon, "Monitor");
export const Palette = icon(PaintBoardIcon, "Palette");
export const Accessibility = icon(AccessibilityIcon, "Accessibility");
export const Database = icon(Database02Icon, "Database");

// Matérias e áreas
export const Atom = icon(Atom01Icon, "Atom");
export const BookOpen = icon(BookOpen01Icon, "BookOpen");
export const BookCopy = icon(LibraryIcon, "BookCopy");
export const Brain = icon(Brain02Icon, "Brain");
export const FlaskConical = icon(TestTube01Icon, "FlaskConical");
export const Globe = icon(Globe02Icon, "Globe");
export const Landmark = icon(BankIcon, "Landmark");
export const Languages = icon(TranslateIcon, "Languages");
export const Leaf = icon(Leaf01Icon, "Leaf");
export const PenLine = icon(QuillWrite01Icon, "PenLine");
export const ScrollText = icon(Scroll01Icon, "ScrollText");
export const Sigma = icon(SigmaIcon, "Sigma");
export const Users = icon(UserGroupIcon, "Users");

// Conquistas
export const Calendar = icon(Calendar04Icon, "Calendar");
export const Compass = icon(Compass01Icon, "Compass");
export const Crosshair = icon(Target01Icon, "Crosshair");
export const Footprints = icon(FootprintsIcon, "Footprints");
export const Mountain = icon(MountainIcon, "Mountain");
export const Star = icon(StarIcon, "Star");

// Sessão e configuração
export const AlertTriangle = icon(Alert02Icon, "AlertTriangle");
export const ArrowUpRight = icon(ArrowUpRight01Icon, "ArrowUpRight");
export const Bookmark = icon(Bookmark02Icon, "Bookmark");
export const BookmarkCheck = icon(BookmarkCheck02Icon, "BookmarkCheck");
export const CalendarRange = icon(Calendar01Icon, "CalendarRange");
export const Eraser = icon(EraserIcon, "Eraser");
export const Flag = icon(Flag02Icon, "Flag");
export const Focus = icon(CenterFocusIcon, "Focus");
export const Hourglass = icon(HourglassIcon, "Hourglass");
export const Layers = icon(Layers01Icon, "Layers");
export const ListOrdered = icon(LeftToRightListNumberIcon, "ListOrdered");
export const PanelRightClose = icon(SidebarRight01Icon, "PanelRightClose");
export const PanelRightOpen = icon(SidebarRightIcon, "PanelRightOpen");
export const Pause = icon(PauseIcon, "Pause");
export const Send = icon(SentIcon, "Send");
export const Settings2 = icon(FilterHorizontalIcon, "Settings2");
export const Shuffle = icon(ShuffleIcon, "Shuffle");
export const SkipForward = icon(NextIcon, "SkipForward");
export const SlidersHorizontal = icon(SlidersHorizontalIcon, "SlidersHorizontal");
export const Wand2 = icon(MagicWand01Icon, "Wand2");
