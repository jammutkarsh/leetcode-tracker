import { Filter, Search } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const controlClassName =
  "h-9 w-full border-transparent bg-secondary/55 shadow-none backdrop-blur-sm";

const Filters = ({
  searchQuery,
  setSearchQuery,
  categories,
  difficulties,
  filterCategory,
  setFilterCategory,
  filterDifficulty,
  setFilterDifficulty,
  filterStatus,
  setFilterStatus,
  pageSize,
  setPageSize,
  pageSizeOptions,
  showPageSizeControl = true,
}) => {
  const content = (
    <>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
        <div className="flex-col gap-1.5 hidden md:flex col-span-1">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-2.5 z-10 h-4 w-4 text-foreground/70" />
            <Input
              id="search-query"
              placeholder="Search problems..."
              className={`${controlClassName} pl-8`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-category">Category</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger id="filter-category" className={controlClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-difficulty">Difficulty</Label>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger id="filter-difficulty" className={controlClassName}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {difficulties.map((diff) => (
                  <SelectItem key={diff} value={diff}>
                    {diff}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="filter-status">Status</Label>
          <Select value={filterStatus || "All"} onValueChange={setFilterStatus}>
            <SelectTrigger id="filter-status" className={controlClassName}>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Solved">Solved</SelectItem>
                <SelectItem value="Unsolved">Unsolved</SelectItem>
                <SelectItem value="Due Today">Due Today</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {showPageSizeControl ? (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="filter-page-size">Page Size</Label>
            <Select
              value={String(pageSize)}
              onValueChange={(val) => setPageSize(Number(val))}
            >
              <SelectTrigger id="filter-page-size" className={controlClassName}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} rows
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}
      </div>
      <div className="md:hidden relative mt-3">
        <Search className="pointer-events-none absolute left-2.5 top-2 z-10 h-4 w-4 text-foreground/70" />
        <Input
          placeholder="Search problems..."
          className={`${controlClassName} pl-8`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </>
  );

  // Clear all filters handler
  const handleClearFilters = () => {
    setSearchQuery("");
    if (setFilterCategory) setFilterCategory("All");
    if (setFilterDifficulty) setFilterDifficulty("All");
    if (setFilterStatus) setFilterStatus("All");
  };

  return (
    <div className="flex flex-col gap-2 border-b border-border/50 pb-3">
      <div className="flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <Filter className="size-3.5" />
        Filters
        <span
          role="button"
          tabIndex={0}
          onClick={handleClearFilters}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleClearFilters();
          }}
          className="ml-auto rounded border border-border bg-muted px-2 py-1 text-xs font-normal text-muted-foreground transition-colors hover:bg-background hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 cursor-pointer"
        >
          Clear All
        </span>
      </div>
      {content}
    </div>
  );
};

export default Filters;
