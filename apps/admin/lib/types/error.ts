export interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}
