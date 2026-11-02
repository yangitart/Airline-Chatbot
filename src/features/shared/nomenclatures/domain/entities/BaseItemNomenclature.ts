export interface SelectNomenclature {
  key: number | string;
  label: string;
}

export type BaseItemNomenclature = {
  url?: string;
  key?: number | string;
  name?: string;
  label?: string;
  value?: string;
  codename?: string;
  code?: string;
  role?: number;
  dpa?: string;
};

export const mapItemNomenclatureToSelectNomenclature = (
  items: BaseItemNomenclature[],
): SelectNomenclature[] => {
  return items.map((e) => {
    const item: SelectNomenclature = {
      key: '',
      label: '',
    };

    if (e.url) {
      item.key = e.url;
    }
    if (e.name) {
      item.label = e.name;
    }
    if (e.value) {
      item.label = e.value;
    }

    return item;
  });
};
