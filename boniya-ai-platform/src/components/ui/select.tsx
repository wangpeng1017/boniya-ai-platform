import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-3 h-4 w-4 opacity-50 pointer-events-none" />
    </div>
  )
)
Select.displayName = "Select"

// 简化的组件，保持API兼容性
interface SelectTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

interface SelectItemProps extends React.OptionHTMLAttributes<HTMLOptionElement> {
  children: React.ReactNode
}

interface SelectValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  placeholder?: string
}

const SelectTrigger = ({ children, className, ...props }: SelectTriggerProps) => (
  <div className={cn("flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm", className)} {...props}>
    {children}
    <ChevronDown className="h-4 w-4 opacity-50" />
  </div>
)

const SelectContent = ({ children, ...props }: SelectContentProps) => (
  <div {...props}>{children}</div>
)

const SelectItem = ({ children, value, ...props }: SelectItemProps) => (
  <option value={value} {...props}>{children}</option>
)

const SelectValue = ({ placeholder, ...props }: SelectValueProps) => (
  <span {...props}>{placeholder}</span>
)

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}
