import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface SearchInputProps {
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSearch: () => void;
}

export function SearchInput({ placeholder, value, onChange, onSearch }: SearchInputProps) {
    return (
        <Field orientation="horizontal">
            <Input type="search" placeholder={placeholder} value={value} onChange={onChange} />
            <button className="btn-primary" onClick={onSearch}>Search</button>
        </Field>
    )
}
