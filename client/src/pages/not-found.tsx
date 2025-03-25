import React from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const { t } = useTranslation();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-9xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mb-4">{t("pageNotFound")}</h2>
      <p className="text-muted-foreground mb-6">{t("pageNotFoundDescription")}</p>
      <Link href="/">
        <div className="cursor-pointer">
          <Button>
            <span className="material-icons mr-2">home</span>
            {t("returnHome")}
          </Button>
        </div>
      </Link>
    </div>
  );
}
