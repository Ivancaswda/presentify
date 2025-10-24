import React, { useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const EditOutlineDialog = ({ children, outlineData, onUpdate }: any) => {
    const [localData, setLocalData] = useState(outlineData);
    const [openDialog, setOpenDialog] = useState<boolean>(false);

    const handleChange = (field: string, value: string) => {
        setLocalData((prev: any) => ({ ...prev, [field]: value }));
    };

    const handleUpdate = async () => {
        if (typeof onUpdate === "function") {
            onUpdate(outlineData?.slideNo, localData);
        } else {
            console.warn("onUpdate is not a function");
        }
        setOpenDialog(false);
    };

    return (
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Редактор слайда</DialogTitle>
                    <DialogDescription>
                        <div className="space-y-4 mt-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Название слайда
                                </label>
                                <Input
                                    onChange={(event) =>
                                        handleChange("slidePoint", event.target.value)
                                    }
                                    placeholder="Название слайда"
                                    value={localData.slidePoint}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-600 mb-1">
                                    Набросок
                                </label>
                                <Textarea
                                    onChange={(event) =>
                                        handleChange("outline", event.target.value)
                                    }
                                    placeholder="Набросок"
                                    value={localData.outline}
                                />
                            </div>
                        </div>
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Отмена</Button>
                    </DialogClose>

                    <Button onClick={handleUpdate}>Редактировать</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditOutlineDialog;
