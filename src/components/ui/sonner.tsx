import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
<<<<<<< HEAD
      toastOptions={{
        classNames: {
          toast: "!max-w-[360px] !w-[360px]",
        },
      }}
=======
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
<<<<<<< HEAD
          "--width": "360px",
=======
>>>>>>> 1914fd68a18a49ff8ed72c9014eb86e24651e0d9
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
