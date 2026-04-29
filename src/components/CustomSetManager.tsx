import { useState } from "react";
import { AlertCircle, BookPlus, Link as LinkIcon, Plus } from "lucide-react";
import {
  buildCustomProblem,
  fetchProblemDetails,
  isProblemCompleteForTracking,
  parseLeetCodeUrl,
} from "../lib/tracker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

const fallbackDefaults = {
  title: "",
  difficulty: "Medium",
  topics: "",
};

const DUPLICATE_PROBLEM_ERROR = "This problem is already being tracked.";

const CustomSetManager = ({ onAddProblem, selectedList, onPrepareList }) => {
  const [problemUrl, setProblemUrl] = useState("");
  const [error, setError] = useState("");
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  const [fallbackProblem, setFallbackProblem] = useState(null);
  const [fallbackForm, setFallbackForm] = useState(fallbackDefaults);
  const [open, setOpen] = useState(false);

  const resetForm = () => {
    setProblemUrl("");
    setFallbackProblem(null);
    setFallbackForm(fallbackDefaults);
    setError("");
    setIsFetchingMetadata(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const parsed = parseLeetCodeUrl(problemUrl);

    if (!parsed) {
      setError("Enter a valid LeetCode problem URL.");
      return;
    }

    setError("");
    setIsFetchingMetadata(true);

    try {
      const apiProblem = await fetchProblemDetails(parsed.slug);
      if (!isProblemCompleteForTracking(apiProblem)) {
        setFallbackProblem(apiProblem);
        setFallbackForm({
          title: apiProblem.title || parsed.title,
          difficulty: apiProblem.difficulty || "Medium",
          topics: (apiProblem.topics || []).join(", "),
        });
        setError("API data was incomplete. Add the missing fields below.");
        setIsFetchingMetadata(false);
        return;
      }

      const result = onAddProblem(apiProblem);
      if (!result.ok) {
        if (result.error === DUPLICATE_PROBLEM_ERROR) {
          resetForm();
          setOpen(false);
          return;
        }

        setError(result.error);
        setIsFetchingMetadata(false);
        return;
      }
      resetForm();
      setOpen(false);
    } catch {
      setFallbackProblem(
        buildCustomProblem({
          slug: parsed.slug,
          url: parsed.url,
          title: parsed.title,
          questionId: null,
          difficulty: "Medium",
          topics: [],
          companies: [],
        }),
      );
      setFallbackForm({
        title: parsed.title,
        difficulty: "Medium",
        topics: "",
      });
      setError(
        "API lookup failed. Add title, difficulty, and topics manually.",
      );
      setIsFetchingMetadata(false);
    }
  };

  const submitFallback = (event) => {
    event.preventDefault();
    if (!fallbackProblem) {
      return;
    }

    const topics = fallbackForm.topics
      .split(",")
      .map((topic) => topic.trim())
      .filter(Boolean);

    if (!fallbackForm.title.trim() || !topics.length) {
      setError("Title and at least one topic are required.");
      return;
    }

    const result = onAddProblem({
      ...fallbackProblem,
      title: fallbackForm.title.trim(),
      difficulty: fallbackForm.difficulty,
      topics,
      companies: fallbackProblem.companies || [],
    });
    if (!result.ok) {
      if (result.error === DUPLICATE_PROBLEM_ERROR) {
        resetForm();
        setOpen(false);
        return;
      }

      setError(result.error);
      return;
    }
    resetForm();
    setOpen(false);
  };

  const isSelected = selectedList === "Custom Tracking";

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (val && !isSelected) {
          onPrepareList?.();
        }
        setOpen(val);
        if (!val) resetForm();
      }}
    >
      <DialogTrigger
        render={
          <Button variant="default" size="sm" className="gap-1 shadow-sm">
            <Plus size={16} />
            Add Problem
          </Button>
        }
      />
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookPlus
              size={20}
              className="text-orange-600 dark:text-orange-400"
            />
            Add Problem
          </DialogTitle>
          <DialogDescription>
            Add a LeetCode problem by URL. Problems are saved to your custom
            tracking list automatically.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="problem-url">LeetCode Problem URL</Label>
            <div className="relative">
              <LinkIcon
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                id="problem-url"
                value={problemUrl}
                onChange={(event) => setProblemUrl(event.target.value)}
                placeholder="https://leetcode.com/problems/two-sum/"
                className="pl-9"
              />
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </p>
          ) : null}

          {isFetchingMetadata ? (
            <p className="text-sm text-muted-foreground">
              Fetching problem data...
            </p>
          ) : null}
        </form>

        {fallbackProblem ? (
          <>
            <Separator className="my-2" />
            <form onSubmit={submitFallback} className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold text-foreground">
                Complete Missing Metadata
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fallback-title">Title</Label>
                  <Input
                    id="fallback-title"
                    value={fallbackForm.title}
                    onChange={(event) =>
                      setFallbackForm((prev) => ({
                        ...prev,
                        title: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="fallback-difficulty">Difficulty</Label>
                  <Select
                    value={fallbackForm.difficulty}
                    onValueChange={(val) =>
                      setFallbackForm((prev) => ({ ...prev, difficulty: val }))
                    }
                  >
                    <SelectTrigger id="fallback-difficulty" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Easy">Easy</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Hard">Hard</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="fallback-topics">Topics</Label>
                <Input
                  id="fallback-topics"
                  value={fallbackForm.topics}
                  onChange={(event) =>
                    setFallbackForm((prev) => ({
                      ...prev,
                      topics: event.target.value,
                    }))
                  }
                  placeholder="Array, Hash Table"
                />
              </div>
              <Button
                type="submit"
                variant="default"
                className="self-start gap-2"
              >
                <Plus size={16} />
                Save Fallback Metadata
              </Button>
            </form>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default CustomSetManager;
