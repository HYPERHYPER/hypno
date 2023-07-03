import { ReactNode, forwardRef, useEffect } from "react";
import Modal from "../Modal";
import { AutosaveStatusText } from "../Form/AutosaveStatusText";
import DataFieldInput, { FieldSelect } from "./DataFieldInput";
import _ from "lodash";
import useArrayState from "@/hooks/useArrayState";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useFormContext } from "react-hook-form";
import { convertFieldArrayToObject } from "@/helpers/event";
import useDeepCompareEffect from "use-deep-compare-effect";
import FormControl from "../Form/FormControl";

export default function DataCaptureModal({
    children,
    status,
}: {
    children?: ReactNode,
    status: any,
}) {
    const { setValue, watch, register } = useFormContext();
    const fields = watch().fields;

    const { items, add, remove, update, reorder } = useArrayState({ required: false, name: '', type: undefined }, fields)
    // const sensors = useSensors(
    //     useSensor(PointerSensor),
    //     useSensor(KeyboardSensor, {
    //         coordinateGetter: sortableKeyboardCoordinates,
    //     })
    // );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = items.indexOf(active.id);
            const newIndex = items.indexOf(over?.id);
            reorder(oldIndex, newIndex);
        }
    }

    useDeepCompareEffect(() => {
        setValue('fields', items, { shouldDirty: true });
    }, [items]);

    function handleAddField(v: string) {
        if (v) {
            const name = v == 'checkbox' ? 'opt-in' : v;
            const required = _.includes(v, '-') && !_.includes(v, 'checkbox') ? true : false; // always require age validation
            add({ required, name, type: v, label: '' })
        }
    }

    return (
        <Modal title='data capture' id='data-modal' menu={status && AutosaveStatusText(status)}>
            <div className='border-t-2 border-white/20'>
                {children}

                {_.map(items, (v, i) => (
                    <DataFieldInput
                        key={i}
                        value={v}
                        onChange={(value) => update(i, value)}
                        onRemove={() => remove(i)}
                        onReorder={(dir) => {
                            if (i == 0 && dir == 'up') return;
                            if (i == items.length - 1 && dir == 'down') return;
                            reorder(i, dir == 'up' ? i - 1 : i + 1);
                        }}
                    />
                ))}

                {/* <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext 
                        items={items}
                        strategy={verticalListSortingStrategy}
                    >
                        {_.map(items, (v, i) => (
                            <>
                            <span>reorder</span>
                            <DataFieldInput key={i} value={v} onChange={(value) => update(i, value)} onRemove={() => remove(i)} />
                            </>
                        ))}
                    </SortableContext>
                </DndContext> */}

                <div className="py-5 flex flex-row justify-between items-center min-h-[60px] border-b-2 border-white/20">
                    <FieldSelect value={undefined} resetOnSelect={true} onSelect={handleAddField} />
                </div>

                <FormControl label='fine print' dir='col'>
                    <h3 className="text-white/40 sm:text-xl">{'format links like <link|https://domain.com>'}</h3>
                    <textarea
                        className='textarea pro left flex-1 w-full'
                        placeholder='additional info'
                        {...register('terms_privacy')} />
                </FormControl>
            </div>
        </Modal>
    )
}

// function SortableItem({ children, id }: { children?: ReactNode, id: any }) {
//     const {
//         attributes,
//         listeners,
//         setNodeRef,
//         transform,
//         transition,
//     } = useSortable({ id: id });

//     const style = {
//         transform: CSS.Transform.toString(transform),
//         transition,
//     };

//     return (
//         <Item ref={setNodeRef} style={style} {...attributes} {...listeners}>
//             {children}
//         </Item>
//     );
// }

// const Item = forwardRef(({ id, children, ...props }: any, ref) => {
//     return (
//         <div {...props} ref={ref}>{children}</div>
//     )
// });