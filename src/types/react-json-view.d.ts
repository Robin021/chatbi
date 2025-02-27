declare module 'react-json-view' {
    import { Component } from 'react';

    export interface ReactJsonViewProps {
        src: object;
        name?: string | false;
        theme?: string;
        style?: React.CSSProperties;
        iconStyle?: 'circle' | 'triangle' | 'square';
        indentWidth?: number;
        collapsed?: boolean | number;
        collapseStringsAfterLength?: number;
        shouldCollapse?: (field: { name: string; src: any; type: string; namespace: string[] }) => boolean;
        groupArraysAfterLength?: number;
        enableClipboard?: boolean;
        displayObjectSize?: boolean;
        displayDataTypes?: boolean;
        defaultValue?: any;
        sortKeys?: boolean;
        validationMessage?: string;
        displayArrayKey?: boolean;
        onEdit?: (edit: { updated_src: object; existing_value: any; name: string; namespace: string[]; new_value: any }) => void;
        onAdd?: (add: { updated_src: object; name: string; namespace: string[]; new_value: any }) => void;
        onDelete?: (del: { updated_src: object; name: string; namespace: string[]; existing_value: any }) => void;
        onSelect?: (select: { name: string; namespace: string[]; value: any }) => void;
    }

    export default class ReactJson extends Component<ReactJsonViewProps> {}
} 