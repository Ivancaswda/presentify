import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {Button} from "@/components/ui/button";
import {ArrowRight, EditIcon} from "lucide-react";
import EditOutlineDialog from "@/app/workspace/project/[projectId]/outline/_components/EditOutlineDialog";

interface OutlineSectionProps {
    loading: boolean;
    outline?: { slideNo: string; slidePoint: string; outline: string }[];
    handleUpdateOutline:any
}

const OutlineSection = ({ loading, outline = [], handleUpdateOutline }: OutlineSectionProps) => {
    console.log(outline)

    return (
        <div className="mt-7 relative">
            <h2 className="font-semibold text-xl mb-4">План слайдов</h2>

            {loading && (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((item) => (
                        <Skeleton key={item} className="h-[60px] w-full rounded-lg" />
                    ))}
                </div>
            )}

            {!loading && outline.length > 0 && (
                <div className="space-y-4 mb-24">
                    {outline.map((slide, index) => (
                        <div
                            key={index}
                            className="border flex justify-between items-center p-4 rounded-lg bg-white shadow-sm hover:shadow-md transition"
                        >
                          <div>
                              <p className="text-sm text-gray-500">
                                  Слайд {slide.slideNo || index + 1}
                              </p>
                              <h3 className="font-semibold text-lg">{slide.slidePoint}</h3>
                              <p className="text-gray-700 text-sm mt-1">{slide.outline}</p>
                          </div>
                            <EditOutlineDialog onUpdate={handleUpdateOutline} outlineData={slide}>
                                <Button variant='ghost'>
                                    <EditIcon/>
                                </Button>
                            </EditOutlineDialog>


                        </div>
                    ))}
                </div>
            )}

            {!loading && outline.length === 0 && (
                <p className="text-gray-500 text-sm">План еще не сгенерирован.</p>
            )}


        </div>
    );
};

export default OutlineSection;
