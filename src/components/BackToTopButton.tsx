import { ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const BackToTopButton = ({ visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <Button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      size="icon"
      className="fixed bottom-6 right-6 z-20 size-12 rounded-full shadow-lg"
      aria-label="Back to top"
    >
      <ArrowUp />
    </Button>
  );
};

export default BackToTopButton;
