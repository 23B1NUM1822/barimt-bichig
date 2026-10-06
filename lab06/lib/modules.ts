/**
 * The four learning modules of the platform and the site's name.
 *
 * @module
 */
import { CodeXml, Cpu, Languages, Sigma, type LucideIcon } from "lucide-react";

/**
 * The site's display name and tagline, used in page titles, the sidebar, and the home page footer.
 *
 * @example
 * ```ts
 * import { siteConfig } from "@/lib/modules";
 *
 * export const metadata = { title: siteConfig.name, description: siteConfig.tagline };
 * ```
 */
export const siteConfig = {
  /** Product name shown in the UI. */
  name: "LearnLab AI",
  /** One-line description in Mongolian. */
  tagline: "Хиймэл оюунд суурилсан боловсрол ба код дадлагын платформ",
};

/**
 * URL-safe ID of a learning module. It is also the `slug` of the matching category row in the database
 * and the last part of the route `/modules/{slug}`.
 *
 * @example
 * ```ts
 * import type { ModuleSlug } from "@/lib/modules";
 *
 * const slug: ModuleSlug = "programming"; // the module of the `binary-search` problem
 * ```
 */
export type ModuleSlug = "programming" | "math" | "architecture" | "languages";

/**
 * Display data for one learning module: its texts, icon, and colors.
 *
 * @example
 * The module that the `binary-search` problem belongs to:
 * ```ts
 * import { getModule, type LearningModule } from "@/lib/modules";
 *
 * const programming: LearningModule = getModule("programming");
 * console.log(programming.shortTitle, programming.href); // "Програмчлал" "/modules/programming"
 * ```
 */
export type LearningModule = {
  /** ID of the module. */
  slug: ModuleSlug;
  /** Route of the module's page. */
  href: `/modules/${ModuleSlug}`;
  /** Full title in Mongolian, shown on the home page card and the module page. */
  title: string;
  /** Short title in Mongolian, shown in the sidebar, breadcrumbs, and browser tab titles. */
  shortTitle: string;
  /** One or two sentences that describe the module. */
  description: string;
  /** Topic tags shown on the home page card and the module page. */
  topics: string[];
  /** Features planned for this module; shown on its placeholder page. */
  planned: {
    /** Name of the planned feature. */
    title: string;
    /** One sentence about the planned feature. */
    description: string;
  }[];
  /** Icon component from `lucide-react`. */
  icon: LucideIcon;
  /** Full Tailwind class strings so the compiler can detect them. */
  accent: {
    /** Text color classes. */
    text: string;
    /** Background and ring classes for the icon. */
    iconBg: string;
    /** Gradient classes for the card's top accent line and the module page's background glow. */
    gradient: string;
    /** Shadow classes applied when the card is hovered. */
    glow: string;
  };
};

/**
 * All four learning modules, in the order they appear in the sidebar: `programming`, `math`,
 * `architecture`, `languages`.
 *
 * @example
 * ```ts
 * import { modules } from "@/lib/modules";
 *
 * console.log(modules.map((m) => m.slug)); // ["programming", "math", "architecture", "languages"]
 * ```
 */
export const modules: LearningModule[] = [
  {
    slug: "programming",
    href: "/modules/programming",
    title: "Програм хангамжийн инженерчлэл ба програмчлал",
    shortTitle: "Програмчлал",
    description:
      "AI ментортой хамт бодит код бичиж, алдааг нь засаж, сайжруулаарай. Ментор таны ажлыг хянаж, дизайны шийдлүүдийг тайлбарлана.",
    topics: ["Код бичих", "Алдаа засах", "ООП", "Архитектур"],
    planned: [
      { title: "Интерактив код засварлагч", description: "Хөтөч дээрээ дасгал бодож, тестийн үр дүнг шууд хараарай." },
      { title: "AI алдаа хайх туслах", description: "Хариултыг биш, алдаа руу чиглүүлэх зөвлөмж аваарай." },
      { title: "ООП загварчлалын даалгавар", description: "Класс, интерфейс, загваруудаар бодит системийг загварчлаарай." },
      { title: "Архитектурын үнэлгээ", description: "Бүтэц, хамаарал, өргөтгөх чадварын талаар зөвлөгөө аваарай." },
    ],
    icon: CodeXml,
    accent: {
      text: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-500/10 ring-violet-500/20",
      gradient: "from-violet-500 to-indigo-500",
      glow: "group-hover:shadow-violet-500/10",
    },
  },
  {
    slug: "math",
    href: "/modules/math",
    title: "Дээд математик ба логик",
    shortTitle: "Математик ба логик",
    description:
      "Алхам алхмаар тайлбарласан бодолт болон AI-ийн үүсгэсэн дасгалуудаар математик анализ, алгоритмын шинжилгээний ойлголтоо бататгаарай.",
    topics: ["Математик анализ", "Хязгаар", "Асимптот шинжилгээ"],
    planned: [
      { title: "Алхам алхмаар бодогч", description: "Хувиргалт бүрийг үндэслэлийнх нь хамт хараарай." },
      { title: "Хязгаар ба уламжлалын дасгал", description: "Таны ахицын дагуу аажмаар хүндэрдэг дасгалууд." },
      { title: "Big-O шинжлэгч", description: "Алгоритмын хүндрэлийг тооцоолж, баталгаагаа шалгаарай." },
      { title: "Логик баталгаа", description: "Удирдамжтай дасгалаар формал сэтгэлгээгээ хөгжүүлээрэй." },
    ],
    icon: Sigma,
    accent: {
      text: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10 ring-amber-500/20",
      gradient: "from-amber-500 to-orange-500",
      glow: "group-hover:shadow-amber-500/10",
    },
  },
  {
    slug: "architecture",
    href: "/modules/architecture",
    title: "Компьютерийн архитектур",
    shortTitle: "Компьютерийн архитектур",
    description:
      "Логик хаалга, санах ойн шатлалаас эхлээд процессор командыг хэрхэн гүйцэтгэх хүртэл компьютер яг яаж ажилладгийг судлаарай.",
    topics: ["Санах ой", "Логик хаалга", "Процессор"],
    planned: [
      { title: "Логик хаалганы симулятор", description: "Хэлхээ угсарч, дохио хэрхэн дамжихыг бодит хугацаанд хараарай." },
      { title: "Санах ойн шатлалын лаборатори", description: "Кэш, оносон ба алдсан хандалт, саатлыг дүрслэн хараарай." },
      { title: "CPU конвейерийн дүрслэл", description: "Татах, тайлах, гүйцэтгэх, бичих үе шатуудыг алхам алхмаар ажиглаарай." },
      { title: "Ассемблерын дасгал", description: "Өндөр түвшний кодыг машины команд руу, мөн эсрэгээр хөрвүүлээрэй." },
    ],
    icon: Cpu,
    accent: {
      text: "text-emerald-600 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10 ring-emerald-500/20",
      gradient: "from-emerald-500 to-teal-500",
      glow: "group-hover:shadow-emerald-500/10",
    },
  },
  {
    slug: "languages",
    href: "/modules/languages",
    title: "Гадаад хэл",
    shortTitle: "Гадаад хэл",
    description:
      "Дүрмээ дадлагажуулж, AI хамтрагчтай бодит яриа өрнүүлж, эссэ бичлэгтээ дэлгэрэнгүй зөвлөгөө аваарай.",
    topics: ["Дүрэм", "Ярианы дадлага", "Эссэ бичих"],
    planned: [
      { title: "AI ярианы хамтрагч", description: "Өдөр тутмын сэдвээр ярилцаж, алдаагаа зөөлөн засуулаарай." },
      { title: "Дүрмийн дасгалжуулагч", description: "Таны бодитоор гаргадаг алдаанд тулгуурласан дасгалууд." },
      { title: "Эссэний үнэлгээ", description: "Бүтэц, үгийн сан, найруулгын талаар дэлгэрэнгүй тайлбар." },
      { title: "Үгийн сан бататгагч", description: "Хичээлээс тань автоматаар үүсгэсэн, давтамжтай давтах картууд." },
    ],
    icon: Languages,
    accent: {
      text: "text-rose-600 dark:text-rose-400",
      iconBg: "bg-rose-500/10 ring-rose-500/20",
      gradient: "from-rose-500 to-pink-500",
      glow: "group-hover:shadow-rose-500/10",
    },
  },
];

/**
 * Returns the display data of one learning module.
 *
 * @param slug - ID of the module.
 * @returns The matching entry of {@link modules}.
 * @throws `Error` With the message `Unknown module: <slug>` when a type cast forces in a string that is
 *   not a {@link ModuleSlug}.
 *
 * @example
 * The module of the `binary-search` problem:
 * ```ts
 * import { getModule } from "@/lib/modules";
 *
 * const programming = getModule("programming");
 * console.log(programming.topics); // ["Код бичих", "Алдаа засах", "ООП", "Архитектур"]
 * ```
 */
export function getModule(slug: ModuleSlug): LearningModule {
  const found = modules.find((m) => m.slug === slug);
  if (!found) throw new Error(`Unknown module: ${slug}`);
  return found;
}
