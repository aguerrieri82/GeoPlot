

interface Clipboard {
    write(data: Iterable<ClipboardItem>): Promise<void>;
}

interface ClipboardItem {
}

declare var ClipboardItem: {
    prototype: ClipboardItem;
    new(items: { [type: string]: Blob | string }): ClipboardItem;
};
