"use client";

import Image from "next/image";
import Link, { useLinkStatus } from "next/link";
import { LogOut, Menu, UserRound, X } from "lucide-react";
import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type { GoogleUser } from "@/src/features/authentication/domain/models/GoogleUser";
import { LanguagePicker } from "@/src/components/navigation/LanguagePicker";

export const travelNavItems = [
  { key: "bookManage", href: "/#book-manage" },
  { key: "whereFly", href: "/#where-we-fly" },
  { key: "prepareTravel", href: "/#prepare-to-travel" },
  { key: "faqs", href: "/#faqs" },
  { key: "experience", href: "/#experience" },
] as const;

export type TravelTab = (typeof travelNavItems)[number]["key"];

export function getTravelTab(pathname: string): TravelTab | undefined {
  if (pathname === "/flight-status") return "prepareTravel";
  if (pathname.startsWith("/faqs/")) return "faqs";
  return ["/", "/my-trips", "/profile"].includes(pathname)
    ? "bookManage"
    : undefined;
}

const focusStyle =
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-airline-garnet";

function TabPending() {
  const { pending } = useLinkStatus();
  return (
    <span
      aria-hidden="true"
      className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-airline-gold transition-opacity duration-150 motion-reduce:transition-none ${pending ? "opacity-100" : "opacity-0"}`}
    />
  );
}

function AccountDialog({
  displayName,
  email,
  initial,
  onClose,
  onSignOut,
}: {
  displayName: string;
  email: string;
  initial: string;
  onClose: () => void;
  onSignOut: () => void;
}) {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pressedBackdrop = useRef(false);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    dialog.showModal();
    root.style.overflow = "hidden";
    return () => {
      dialog.close();
      root.style.overflow = previousOverflow;
    };
  }, []);

  const dismiss = () => {
    dialogRef.current?.close();
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      className="m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-sm overflow-y-auto overscroll-contain rounded-[28px] border border-airline-line bg-airline-paper p-0 text-airline-ink shadow-2xl backdrop:bg-airline-night/60 backdrop:backdrop-blur-sm motion-safe:animate-soft-rise motion-safe:[animation-duration:240ms]"
      onCancel={(event) => {
        event.preventDefault();
        dismiss();
      }}
      onPointerDown={(event) => {
        pressedBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={(event) => {
        if (pressedBackdrop.current && event.target === event.currentTarget)
          dismiss();
      }}
    >
      <div className="relative border-b border-airline-line bg-gradient-to-br from-airline-forest-soft to-airline-canvas px-6 pb-6 pt-8 text-center">
        <button
          type="button"
          aria-label={t("flightSearch.nav.closeAccount")}
          onClick={dismiss}
          className={`absolute right-3 top-3 grid size-10 place-items-center rounded-full text-airline-forest transition-colors hover:bg-airline-forest/10 ${focusStyle}`}
        >
          <X size={18} aria-hidden="true" />
        </button>
        <div
          aria-hidden="true"
          className="mx-auto grid size-[72px] place-items-center rounded-full border-4 border-airline-paper bg-airline-forest font-serif text-3xl font-bold text-white shadow-md ring-1 ring-airline-gold/50"
        >
          {initial || <UserRound size={28} />}
        </div>
        <h2
          id={titleId}
          className="mt-4 break-words font-serif text-2xl font-bold text-airline-night"
        >
          {displayName || email || "Veyra"}
        </h2>
        {displayName && email && (
          <p className="mt-1 break-words text-sm text-airline-ink/75">{email}</p>
        )}
      </div>
      <div className="p-5">
        <button
          type="button"
          onClick={() => {
            dismiss();
            onSignOut();
          }}
          className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-airline-garnet px-4 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-airline-garnet/90 ${focusStyle}`}
        >
          <LogOut size={18} aria-hidden="true" />
          {t("flightSearch.nav.signOut")}
        </button>
      </div>
    </dialog>
  );
}

export function FlightsHeader({
  pathname = "/",
  activeTab,
  user,
  authLoading,
  onSignIn,
  onSignOut,
  onEditSearch,
}: {
  pathname?: string;
  activeTab?: TravelTab;
  user: GoogleUser | null;
  authLoading: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onEditSearch?: () => void;
}) {
  const { t, i18n } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const scrollFrame = useRef<number | null>(null);
  const activeKey = activeTab ?? getTravelTab(pathname);
  const displayName = user?.name?.trim() ?? "";
  const initial = (displayName || user?.email || "")
    .charAt(0)
    .toLocaleUpperCase(i18n.resolvedLanguage ?? "en");

  const selectLink = (
    event: MouseEvent<HTMLAnchorElement>,
    key: string,
    href: string,
  ) => {
    setMobileMenuOpen(false);
    if (
      pathname !== "/" ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const sectionId = href.split("#")[1];
    const section = sectionId ? document.getElementById(sectionId) : null;
    if (!section) return;

    event.preventDefault();
    if (window.location.hash !== `#${sectionId}`)
      window.history.pushState(window.history.state, "", href);
    if (key === "bookManage" && onEditSearch) {
      onEditSearch();
      return;
    }

    const headerHeight =
      document.querySelector("header")?.getBoundingClientRect().height ?? 72;
    const target =
      section.getBoundingClientRect().top + window.scrollY - headerHeight - 8;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      if (scrollFrame.current !== null)
        window.cancelAnimationFrame(scrollFrame.current);
      scrollFrame.current = null;
      window.scrollTo(0, target);
      return;
    }
    if (scrollFrame.current !== null)
      window.cancelAnimationFrame(scrollFrame.current);
    const start = window.scrollY;
    const distance = target - start;
    const duration = 320;
    const startedAt = performance.now();
    const animateScroll = (now: number) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      window.scrollTo(0, start + distance * eased);
      if (progress < 1)
        scrollFrame.current = window.requestAnimationFrame(animateScroll);
      else scrollFrame.current = null;
    };
    scrollFrame.current = window.requestAnimationFrame(animateScroll);
  };

  return (
    <header
      className="sticky top-0 z-40 h-[62px] px-3 pt-2 sm:h-[72px] sm:px-6"
      onKeyDown={(event) => {
        if (event.key === "Escape" && mobileMenuOpen) {
          setMobileMenuOpen(false);
          menuButton.current?.focus();
        }
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -bottom-5 top-0 bg-airline-canvas/45 backdrop-blur-[14px] [-webkit-mask-image:linear-gradient(to_bottom,#000_68%,transparent)] [mask-image:linear-gradient(to_bottom,#000_68%,transparent)]"
      />
      <div className="relative mx-auto flex h-full max-w-[1440px] items-center justify-between gap-2 rounded-2xl border border-airline-line bg-airline-paper px-3 shadow-sm supports-[backdrop-filter]:bg-airline-paper/85 sm:gap-4 sm:px-5">
        <Link
          href="/"
          aria-label="Veyra"
          className={
            "flex shrink-0 items-center gap-2 rounded-lg font-serif text-xl font-bold tracking-tight text-airline-night no-underline sm:text-2xl " +
            focusStyle
          }
        >
          <Image src="/icon.svg" alt="" width={32} height={32} />
          <span className="hidden min-[360px]:inline">Veyra</span>
        </Link>

        <nav
          className="hidden items-center gap-1 rounded-full bg-airline-canvas p-1 min-[1051px]:flex"
          aria-label="Main navigation"
        >
          {travelNavItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              prefetch
              onClick={(event) => selectLink(event, key, href)}
              aria-current={key === activeKey ? "page" : undefined}
              className={[
                "relative rounded-full px-3 py-2 text-center text-xs font-semibold no-underline transition-colors motion-reduce:transition-none",
                focusStyle,
                key === activeKey
                  ? "bg-airline-forest text-white"
                  : "text-airline-ink hover:bg-white",
              ].join(" ")}
            >
              {t("flightSearch.nav." + key)}
              <TabPending />
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 shrink-0 items-center gap-1 sm:gap-2">
          <LanguagePicker />
          {authLoading ? (
            <span className="sr-only" role="status">
              {t("flightSearch.nav.checkingSession")}
            </span>
          ) : user ? (
            <>
              <Link
                href="/my-trips"
                className={
                  "hidden rounded-full px-3 py-2 text-xs font-semibold text-airline-forest no-underline hover:bg-airline-canvas min-[1051px]:inline-flex " +
                  focusStyle
                }
              >
                {t("flightSearch.booking.myTrips")}
              </Link>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setAccountDialogOpen(true);
                }}
                title={displayName || user.email}
                aria-label={displayName || user.email || "Veyra"}
                aria-haspopup="dialog"
                className={`grid size-10 shrink-0 place-items-center rounded-full border-2 border-airline-paper bg-airline-forest text-sm font-bold text-white ring-1 ring-airline-gold/60 transition-colors hover:bg-airline-forest/85 ${focusStyle}`}
              >
                <span aria-hidden="true">{initial || <UserRound size={16} />}</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onSignIn}
              aria-label={t("flightSearch.nav.signIn")}
              className={
                "inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-airline-line px-2.5 text-xs font-semibold text-airline-ink hover:bg-airline-canvas sm:px-3 " +
                focusStyle
              }
            >
              <UserRound size={16} aria-hidden="true" />
              <span className="hidden sm:inline">
                {t("flightSearch.nav.signIn")}
              </span>
            </button>
          )}
          <button
            ref={menuButton}
            type="button"
            aria-label={t(
              mobileMenuOpen
                ? "flightSearch.nav.closeMenu"
                : "flightSearch.nav.openMenu",
            )}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobileMenuOpen ? "veyra-mobile-menu" : undefined}
            onClick={() => setMobileMenuOpen((open) => !open)}
            className={
              "grid h-9 w-9 shrink-0 place-items-center rounded-full bg-airline-canvas text-airline-night min-[1051px]:hidden " +
              focusStyle
            }
          >
            {mobileMenuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {accountDialogOpen && user && (
        <AccountDialog
          displayName={displayName}
          email={user.email}
          initial={initial}
          onClose={() => setAccountDialogOpen(false)}
          onSignOut={onSignOut}
        />
      )}

      {mobileMenuOpen && (
        <nav
          id="veyra-mobile-menu"
          aria-label={t("flightSearch.booking.servicesLabel")}
          className="absolute right-3 top-full mt-2 grid w-[min(20rem,calc(100%_-_24px))] gap-1 rounded-2xl border border-airline-line bg-airline-paper p-2 shadow-xl sm:right-6 min-[1051px]:hidden"
        >
          {travelNavItems.map(({ key, href }) => (
            <Link
              key={key}
              href={href}
              prefetch
              onClick={(event) => selectLink(event, key, href)}
              aria-current={key === activeKey ? "page" : undefined}
              className={[
                "rounded-xl px-4 py-3 text-sm font-semibold no-underline",
                focusStyle,
                key === activeKey
                  ? "bg-airline-forest text-white"
                  : "text-airline-ink hover:bg-airline-canvas",
              ].join(" ")}
            >
              {t("flightSearch.nav." + key)}
            </Link>
          ))}
          {user && (
            <Link
              href="/my-trips"
              onClick={() => setMobileMenuOpen(false)}
              className={
                "rounded-xl px-4 py-3 text-sm font-semibold text-airline-forest no-underline hover:bg-airline-canvas " +
                focusStyle
              }
            >
              {t("flightSearch.booking.myTrips")}
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
