"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLeft } from "fp-ts/Either";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { GoogleUser } from "@/src/features/authentication/domain/models/GoogleUser";
import { googleAuthenticationServices } from "@/src/features/authentication/ioc/googleAuthenticationServices";
import { GoogleAuthModal } from "@/src/features/authentication/ui/components/GoogleAuthModal";
import { TravelAssistantWidget } from "@/src/features/chatbot/ui/components/TravelAssistantWidget";
import {
  FlightsHeader,
  getTravelTab,
  travelNavItems,
  type TravelTab,
} from "@/src/features/flights/ui/components/FlightsHeader";
import { TravelPageBackdrop } from "./TravelPageBackdrop";
import { TravelFooter } from "./TravelFooter";
import { TravelShellContext } from "./TravelShellContext";
export function TravelAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [activeTab, setActiveTab] = useState<TravelTab | undefined>(() =>
    getTravelTab(pathname),
  );
  const [authLoading, setAuthLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchAction, setSearchAction] = useState<(() => void) | undefined>();
  const redirectAction = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 1050px)").matches) return;
    // Mobile links are hidden until the menu opens, so warm their routes after the initial load.
    const timer = window.setTimeout(() => {
      const pages = new Set(
        travelNavItems.map(({ href }) => href.split("#")[0]),
      );
      pages.forEach((href) => router.prefetch(href));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveTab(getTravelTab(pathname));
      return;
    }

    const sections = travelNavItems.flatMap(({ key, href }) => {
      const sectionId = href.split("#")[1];
      const section = sectionId ? document.getElementById(sectionId) : null;
      return section ? [{ key, section }] : [];
    });
    if (!sections.length) return;

    const updateActiveTab = () => {
      const activationLine = window.innerHeight * 0.2;
      const activeSection = [...sections]
        .reverse()
        .find(
          ({ section }) =>
            section.getBoundingClientRect().top <= activationLine,
        );
      setActiveTab(activeSection?.key ?? sections[0].key);
    };

    let scrollFrame: number | null = null;
    const scheduleUpdate = () => {
      if (scrollFrame !== null) return;
      scrollFrame = window.requestAnimationFrame(() => {
        scrollFrame = null;
        updateActiveTab();
      });
    };

    updateActiveTab();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate, { passive: true });
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (scrollFrame !== null) window.cancelAnimationFrame(scrollFrame);
    };
  }, [pathname]);

  useEffect(() => {
    let active = true;
    let initialUserLoaded = false;
    let currentUserResolved = false;
    let latestAuthUser: GoogleUser | null | undefined;
    const unsubscribe = googleAuthenticationServices.watchAuthState.execute(
      (nextUser) => {
        if (!active) return;
        if (!initialUserLoaded) {
          latestAuthUser = nextUser;
          return;
        }
        setUser(nextUser);
        setAuthLoading(false);
      },
    );

    const loadUser = async () => {
      try {
        const result = await googleAuthenticationServices.currentUser.execute();
        if (active && !isLeft(result)) {
          setUser(result.right);
          currentUserResolved = true;
        }
      } finally {
        if (active) {
          if (!currentUserResolved && latestAuthUser !== undefined)
            setUser(latestAuthUser);
          initialUserLoaded = true;
          setAuthLoading(false);
        }
      }
    };
    void loadUser().catch(() => undefined);
    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const openSignIn = useCallback((beforeRedirect?: () => void) => {
    redirectAction.current = beforeRedirect;
    setModalOpen(true);
  }, []);

  const closeSignIn = useCallback(() => {
    redirectAction.current = undefined;
    setModalOpen(false);
  }, []);

  const prepareRedirect = useCallback(() => {
    try {
      window.sessionStorage.removeItem("airline-pending-demo-booking");
    } catch {
      /* Optional storage. */
    }
    redirectAction.current?.();
  }, []);

  const registerSearchAction = useCallback((action: () => void) => {
    setSearchAction(() => action);
    return () => {
      setSearchAction((current) => (current === action ? undefined : current));
    };
  }, []);

  const signOut = async () => {
    try {
      const result = await googleAuthenticationServices.signOut.execute();
      if (isLeft(result)) throw new Error(result.left);
      setUser(null);
      if (pathname === "/my-trips" || pathname === "/profile")
        router.replace("/");
    } catch {
      toast.error(t("flightSearch.errors.signOutFailed"));
    }
  };

  return (
    <TravelShellContext.Provider
      value={{ user, authLoading, openSignIn, registerSearchAction }}
    >
      <div className="relative isolate min-h-dvh bg-airline-canvas">
        <TravelPageBackdrop
          tab={activeTab}
          muted={pathname === "/" && Boolean(searchAction)}
        />
        <FlightsHeader
          pathname={pathname}
          activeTab={activeTab}
          user={user}
          authLoading={authLoading}
          onSignIn={() => openSignIn()}
          onSignOut={() => void signOut()}
          onEditSearch={pathname === "/" ? searchAction : undefined}
        />
        <div className="overflow-x-clip">
          <div
            key={pathname}
            className="motion-safe:animate-route-enter motion-reduce:animate-none"
          >
            {children}
          </div>
        </div>
        {pathname === "/" && <TravelFooter />}
        <TravelAssistantWidget />
        {modalOpen && (
          <GoogleAuthModal onClose={closeSignIn} onRedirect={prepareRedirect} />
        )}
      </div>
    </TravelShellContext.Provider>
  );
}
