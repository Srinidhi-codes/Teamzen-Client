import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { resolveAvatarUrl } from '@/lib/utils';

export const MentionList = forwardRef((props: any, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item.id, label: item.display });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: any) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }
      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }
      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }
      return false;
    },
  }));

  if (!props.items || !props.items.length) {
    return null;
  }

  return (
    <div className="bg-popover text-popover-foreground border border-border rounded-lg shadow-md overflow-hidden max-h-[200px] overflow-y-auto min-w-[200px] z-[9999]">
      {props.items.map((item: any, index: number) => (
        <button
          className={`flex items-center gap-3 w-full text-left px-3 py-2 text-sm transition-colors ${
            index === selectedIndex ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
          }`}
          key={item.id}
          onClick={() => selectItem(index)}
        >
          <Avatar className="h-6 w-6">
            <AvatarImage src={resolveAvatarUrl(item.avatar)} className="object-cover" />
            <AvatarFallback>{item.display[0]}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{item.display}</span>
            {item.email && <span className="text-[10px] opacity-70">{item.email}</span>}
          </div>
        </button>
      ))}
    </div>
  );
});
MentionList.displayName = 'MentionList';
