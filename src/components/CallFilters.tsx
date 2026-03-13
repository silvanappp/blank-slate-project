import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useTeamMembers } from "@/hooks/useTeamMembers";

export type Filters = {
  search: string;
  teamMember: string;
  status: string;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
};

type Props = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export function CallFilters({ filters, onChange }: Props) {
  const { data: members } = useTeamMembers();

  const hasFilters = filters.search || filters.teamMember || filters.status || filters.dateFrom || filters.dateTo;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar chamadas..."
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>
      <Select value={filters.teamMember} onValueChange={(v) => onChange({ ...filters, teamMember: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Membro da Equipe" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os Membros</SelectItem>
          {members?.map((m) => (
            <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={filters.status} onValueChange={(v) => onChange({ ...filters, status: v === "all" ? "" : v })}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="processing">Processando</SelectItem>
          <SelectItem value="completed">Concluído</SelectItem>
          <SelectItem value="failed">Falhou</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !filters.dateFrom && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateFrom ? format(filters.dateFrom, "dd/MM") : "De"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={filters.dateFrom} onSelect={(d) => onChange({ ...filters, dateFrom: d })} className="pointer-events-auto" />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className={cn("w-[140px] justify-start text-left font-normal", !filters.dateTo && "text-muted-foreground")}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateTo ? format(filters.dateTo, "dd/MM") : "Até"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={filters.dateTo} onSelect={(d) => onChange({ ...filters, dateTo: d })} className="pointer-events-auto" />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={() => onChange({ search: "", teamMember: "", status: "", dateFrom: undefined, dateTo: undefined })}>
          <X className="h-4 w-4 mr-1" /> Limpar
        </Button>
      )}
    </div>
  );
}
