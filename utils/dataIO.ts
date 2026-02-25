import { LinkItem, TodoItem, Category } from '../types';

export interface ExportData {
    version: '2.0';
    exportedAt: number;
    links: LinkItem[];
    todos: TodoItem[];
    categories: Category[];
}

export const exportToJSON = (links: LinkItem[], todos: TodoItem[], categories: Category[]): void => {
    const data: ExportData = {
        version: '2.0',
        exportedAt: Date.now(),
        links,
        todos,
        categories,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devhub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

export const importFromJSON = (file: File): Promise<ExportData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result as string);
                if (!data.links || !Array.isArray(data.links)) {
                    throw new Error('Invalid format: missing links array');
                }
                // Normalize: ensure isPinned exists on each link
                data.links = data.links.map((l: LinkItem) => ({
                    ...l,
                    isPinned: l.isPinned ?? false,
                }));
                resolve(data as ExportData);
            } catch (e) {
                reject(e);
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
};
