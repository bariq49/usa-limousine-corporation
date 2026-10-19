"use client";

import { useTheme } from "next-themes";
import { Check } from "lucide-react";
import { Button } from "../../components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/dropdown-menu";
import { Moon, Sun } from "../../svg";
import { cn } from "../../utils/cn";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 rounded-full text-default-500 hover:bg-default-100 hover:text-primary md:h-9 md:w-9 dark:text-default-800 dark:hover:bg-default-200"
        >
          <Sun className="h-5 w-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-5 w-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-2">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={cn("mb-[2px] cursor-pointer p-2 text-sm font-medium text-default-600", {
            "bg-primary text-primary-foreground": theme === "light",
          })}
        >
          <Sun className="mr-2 h-5 w-5" />
          <span className="mr-2">Light</span>
          <Check className={cn("ml-auto h-4 w-4 flex-none", { hidden: theme !== "light" })} />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={cn("mb-[2px] cursor-pointer p-2 text-sm font-medium text-default-600", {
            "bg-primary text-primary-foreground": theme === "dark",
          })}
        >
          <Moon className="mr-2 h-5 w-5" />
          <span className="mr-2">Dark</span>
          <Check className={cn("ml-auto h-4 w-4 flex-none", { hidden: theme !== "dark" })} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
