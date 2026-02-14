import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Loader2,
  Save,
  Users,
  CircleDollarSign,
  HelpCircle,
} from "lucide-react";

import { showToast } from "@/redux/slices/toastSlice";
import { useDispatch } from "react-redux";

//========================
// ZOD SCHEMA + TYPES
//========================
const tontineSchema = z.object({
  name: z.string().min(2, "Name is required"),

  tontine_type_id: z.string().min(1, "Please select a tontine type"),

  amount: z.coerce.number().min(1, "Amount must be greater than 0"),

  cycle: z.enum(["weekly", "monthly"], {
    message: "Please select a frequency",
  }),
  duration_months: z.coerce.number().min(
    1,
    "Duration must be at least 1 month"
  ),
});

export type TontineFormValues = z.infer<typeof tontineSchema>;

export interface TontineTypeOption {
  value: string | number;
  label: string;
  description?: string;
}

interface TontineFormProps {
  tontineTypes?: TontineTypeOption[];
  onSubmit: (data: TontineFormValues) => Promise<any>;
  onCancel?: () => void;
  onSuccess?: () => void;
  defaultValues?: Partial<TontineFormValues & { contributionAmount?: number }>;
  isEditing?: boolean;
}

export const TontineForm: React.FC<TontineFormProps> = ({
  tontineTypes = [],
  onSubmit,
  onCancel,
  onSuccess,
  defaultValues = {},
  isEditing = false,
}) => {
  const dispatch = useDispatch();

  const form = useForm<TontineFormValues>({
    resolver: zodResolver(tontineSchema) as any,
    defaultValues: {
      name: defaultValues.name || "",
      tontine_type_id:
        defaultValues.tontine_type_id ||
        (tontineTypes.length ? String(tontineTypes[0].value) : ""),
      amount: defaultValues.contributionAmount || 0,
      cycle: defaultValues.cycle || "monthly",
      duration_months: defaultValues.duration_months || 12,
    },
  });

  const [submitting, setSubmitting] = React.useState(false);
  const watchAll = form.watch();

  const totalCycles =
    watchAll.cycle === "weekly"
      ? Math.round(watchAll.duration_months * 4.33)
      : watchAll.duration_months;

  const selectedType = tontineTypes.find(
    (t) => String(t.value) === String(watchAll.tontine_type_id)
  );

  const handleSubmit: SubmitHandler<TontineFormValues> = async (values) => {
    setSubmitting(true);
    try {
      await onSubmit(values);

      if (onSuccess) onSuccess();
      form.reset();

      dispatch(
        showToast({
          type: "success",
          message: isEditing
            ? "Tontine updated successfully"
            : "Tontine created successfully",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } catch (err: any) {
      console.error(err);
      dispatch(
        showToast({
          type: "danger",
          message: err?.response?.data?.message || err.message || "Something went wrong",
          position: "top-right",
          animation: "slide-right-in",
          duration: 4000,
        })
      );
    } finally {
      setSubmitting(false);
    }
  };

  console.log(selectedType);

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Users className="h-8 w-8" />
          {isEditing ? "Edit Tontine" : "Create New Tontine"}
        </CardTitle>
        <CardDescription>
          {isEditing
            ? "Update your tontine details below."
            : "Set up a new tontine to start collaborative savings with your group."}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Tontine Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="e.g., Family Emergency Fund"
              {...form.register("name")}
              required
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          {/* Tontine Type */}
          <div className="space-y-2">
            <Label htmlFor="tontine_type_id">Tontine Type</Label>
            <Select
              onValueChange={(val) => form.setValue("tontine_type_id", val)}
              defaultValue={form.getValues("tontine_type_id")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select tontine type" />
              </SelectTrigger>
              <SelectContent>
                {tontineTypes.map((type) => (
                  <SelectItem key={type.value} value={String(type.value)}>
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{type.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {type.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.tontine_type_id && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.tontine_type_id.message}
              </p>
            )}
          </div>

          {/* Amount + Frequency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Contribution Amount
                {isEditing && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="inline w-4 h-4 ml-1 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm p-2 rounded bg-muted">
                          You can't change the price of an existing tontine.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </Label>

              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  className="pl-10 w-full"
                  disabled={isEditing}
                  {...form.register("amount", { valueAsNumber: true })}
                />
              </div>
              {form.formState.errors.amount && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.amount.message}
                </p>
              )}
            </div>

            {/* Frequency */}
            <div className="space-y-2">
              <Label htmlFor="cycle">Contribution Frequency</Label>
              <Select
                onValueChange={(val) => form.setValue("cycle", val as any)}
                defaultValue={form.getValues("cycle")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.cycle && (
                <p className="text-red-500 text-sm">
                  {form.formState.errors.cycle.message}
                </p>
              )}
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration_months">Duration (Months)</Label>
            <Input
              id="duration_months"
              type="number"
              min={1}
              max={60}
              {...form.register("duration_months", { valueAsNumber: true })}
              required
            />
            <p className="text-xs text-muted-foreground">
              Total cycles: {totalCycles} {watchAll.cycle} contributions
            </p>
            {form.formState.errors.duration_months && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.duration_months.message}
              </p>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-lg border bg-muted/50 p-4">
            <Label className="text-sm font-medium text-muted-foreground mb-3 block">
              Tontine Summary
            </Label>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Type:</span>
                <Badge variant="secondary">{selectedType?.label || "—"}</Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Per-member contribution:</span>
                <span className="font-bold">
                  ${watchAll.amount} / {watchAll.cycle}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Duration:</span>
                <span className="font-medium">
                  {watchAll.duration_months} months ({totalCycles} cycles)
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm">Estimated pool per cycle:</span>
                <span className="font-bold text-green-600">
                  ${(watchAll.amount * 10).toFixed(2)}{" "}
                  <span className="text-xs text-muted-foreground ml-1">
                    (10 members)
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEditing ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {isEditing ? "Update Tontine" : "Create Tontine"}
                </>
              )}
            </Button>

            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={submitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
