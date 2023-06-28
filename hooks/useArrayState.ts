import { useState } from 'react';

const useArrayState = (initialItemState: any, initialState: any[]) => {
  const [items, setItems] = useState<any[]>(initialState);

  const add = (item?: any) => {
    setItems([...items, item || initialItemState]);
  };

  const remove = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const update = (index: number, updatedItem: any) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItem };
    setItems(updatedItems);
  };

  const reorder = (startIndex: number, endIndex: number) => {
    const updatedItems = [...items];
    const [removedItem] = updatedItems.splice(startIndex, 1);
    updatedItems.splice(endIndex, 0, removedItem);
    setItems(updatedItems);
  };

  return { items, add, remove, update, reorder };
};

export default useArrayState;