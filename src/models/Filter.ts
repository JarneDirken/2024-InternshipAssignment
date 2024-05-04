export interface Filter {
    label: string;
    state: [any, React.Dispatch<React.SetStateAction<any>>];
    inputType: 'text' | 'dateRange' | 'multipleSelect';
    options?: string[];
    optionsKey?: string | undefined;
}