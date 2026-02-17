'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Control, FieldPath, FieldValues } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
  FormField,
} from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';

interface Option {
  value: string;
  label: string;
}

interface FormMultiSelectProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  description?: string;
  options: Option[];
}

export function FormMultiSelect<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  placeholder = 'Sélectionner les éléments...',
  description,
  options,
}: FormMultiSelectProps<TFieldValues, TName>) {
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState('');

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>{label}</FormLabel>

          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="justify-between h-auto min-h-10 py-2"
                >
                  <div className="flex flex-wrap items-center gap-1 flex-1 max-h-24 overflow-y-auto">
                    {field.value &&
                    Array.isArray(field.value) &&
                    field.value.length > 0 ? (
                      field.value.map((selectedValue: string) => {
                        const selectedOption = options.find(
                          (opt) => opt.value === selectedValue,
                        );

                        return (
                          <Badge key={selectedValue} variant="secondary">
                            {selectedOption?.label || selectedValue}

                            <span
                              role="button"
                              tabIndex={0}
                              className="ml-1 hover:text-destructive cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                field.onChange(
                                  field.value.filter(
                                    (v: string) => v !== selectedValue,
                                  ),
                                );
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  field.onChange(
                                    field.value.filter(
                                      (v: string) => v !== selectedValue,
                                    ),
                                  );
                                }
                              }}
                            >
                              <X className="size-3" />
                            </span>
                          </Badge>
                        );
                      })
                    ) : (
                      <span className="text-muted-foreground">
                        {placeholder}
                      </span>
                    )}
                  </div>

                  <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>

            <PopoverContent className="w-full p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Chercher..."
                  value={searchValue}
                  onValueChange={setSearchValue}
                />

                <CommandEmpty>Aucun élément trouvé.</CommandEmpty>

                <CommandList>
                  <CommandGroup>
                    {options
                      .filter((option) =>
                        option.label
                          .toLowerCase()
                          .includes(searchValue.toLowerCase()),
                      )
                      .map((option) => (
                        <CommandItem
                          key={option.value}
                          value={option.value}
                          onSelect={() => {
                            const updatedValue = Array.isArray(field.value)
                              ? field.value.includes(option.value)
                                ? field.value.filter(
                                    (v: string) => v !== option.value,
                                  )
                                : [...field.value, option.value]
                              : [option.value];

                            field.onChange(updatedValue);
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 size-4',
                              Array.isArray(field.value) &&
                                field.value.includes(option.value)
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {option.label}
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
