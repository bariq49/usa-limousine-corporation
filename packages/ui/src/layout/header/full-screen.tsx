"use client";

import type { MouseEventHandler } from "react";
import { Button } from "../../components/button";
import { Expand } from "../../svg";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../components/tooltip";

export function FullScreenToggle() {
  const toggleFullScreen: MouseEventHandler<HTMLButtonElement> = () => {
    const doc = document;
    const docEl = doc.documentElement;
    if (!doc.fullscreenElement) {
      void docEl.requestFullscreen();
    } else {
      void doc.exitFullscreen();
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={toggleFullScreen}
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 rounded-full text-default-500 hover:bg-default-100 hover:text-primary md:h-9 md:w-9 dark:text-default-800 dark:hover:bg-default-200"
          >
            <Expand className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Full Screen</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
