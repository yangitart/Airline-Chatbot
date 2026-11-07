"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isLeft, type Either } from "fp-ts/Either";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import type { IUseCase } from "@/src/core/interfaces/IUseCase";
import type { GoogleUser } from "@/src/features/authentication/domain/models/GoogleUser";
import { GoogleAuthenticationSymbols } from "@/src/features/authentication/ioc/GoogleAuthenticationSymbols";
import { GoogleAuthModal } from "@/src/features/authentication/ui/components/GoogleAuthModal";
import { TravelAssistantWidget } from "@/src/features/chatbot/ui/components/TravelAssistantWidget";
import { FlightsHeader, getTravelTab, travelNavItems } from "@/src/features/flights/ui/components/FlightsHeader";
import { injector } from "@/src/ioc/utils/injector";
import { TravelPageBackdrop } from "./TravelPageBackdrop";
import { TravelShellContext } from "./TravelShellContext";
import styles from "./TravelAppShell.module.css";

type AuthUseCase<T> = IUseCase<void, Promise<Either<string, T>>>;
export function TravelAppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchAction, setSearchAction] = useState<(() => void) | undefined>();
  const redirectAction = useRef<(() => void) | undefined>(undefined);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 1050px)").matches) return;
    // Mobile links are hidden until the menu opens, so warm their routes after the initial load.
    const timer = window.setTimeout(() => {
      travelNavItems.forEach(({ href }) => router.prefetch(href.split("#")[0]));
    }, 1200);
    return () => window.clearTimeout(timer);
  }, [router]);

  useEffect(() => {
    let active = true;
    let initialUserLoaded = false;
    let currentUserResolved = false;
    let latestAuthUser: GoogleUser | null | undefined;
    const unsubscribe = injector<IUseCase<(user: GoogleUser | null) => void, () => void>>(
      GoogleAuthenticationSymbols.authStateUseCase,
    ).execute((nextUser) => {
      if (!active) return;
      if (!initialUserLoaded) {
        latestAuthUser = nextUser;
        return;
      }
      setUser(nextUser);
      setAuthLoading(false);
    });

    const loadUser = async () => {
      try {
        const result = await injector<AuthUseCase<GoogleUser | null>>(GoogleAuthenticationSymbols.currentUserUseCase).execute();
        if (active && !isLeft(result)) {
          setUser(result.right);
          currentUserResolved = true;
        }
      } finally {
        if (active) {
          if (!currentUserResolved && latestAuthUser !== undefined) setUser(latestAuthUser);
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
    try { window.sessionStorage.removeItem("airline-pending-demo-booking"); } catch { /* Optional storage. */ }
    redirectAction.current?.();
  }, []);

  const registerSearchAction = useCallback((action: () => void) => {
    setSearchAction(() => action);
    return () => { setSearchAction((current) => current === action ? undefined : current); };
  }, []);

  const signOut = async () => {
    try {
      const result = await injector<AuthUseCase<void>>(GoogleAuthenticationSymbols.signOutUseCase).execute();
      if (isLeft(result)) throw new Error(result.left);
      setUser(null);
      if (pathname === "/my-trips" || pathname === "/profile") router.replace("/");
    } catch {
      toast.error(t("flightSearch.errors.signOutFailed"));
    }
  };

  return (
    <TravelShellContext.Provider value={{ user, authLoading, openSignIn, registerSearchAction }}>
      <div className="relative isolate min-h-dvh bg-airline-canvas">
        <TravelPageBackdrop tab={getTravelTab(pathname)} muted={pathname === "/" && Boolean(searchAction)} />
        <FlightsHeader pathname={pathname} user={user} authLoading={authLoading} onSignIn={() => openSignIn()}
          onSignOut={() => void signOut()} onEditSearch={pathname === "/" ? searchAction : undefined} />
        <div className="overflow-x-clip">
          <div key={pathname} className={styles.routeView}>{children}</div>
        </div>
        <TravelAssistantWidget />
        {modalOpen && <GoogleAuthModal onClose={closeSignIn} onRedirect={prepareRedirect} />}
      </div>
    </TravelShellContext.Provider>
  );
}
