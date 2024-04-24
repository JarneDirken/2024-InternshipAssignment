export interface Filter {
    label: string;
    state: [string, React.Dispatch<React.SetStateAction<string>>];
    inputType: 'text' | 'dateRange' | 'multipleSelect';
    options?: string[];
    optionsKey?: string | undefined;
}