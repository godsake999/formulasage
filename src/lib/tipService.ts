
import { supabase } from './supabaseClient';
import type { Tip, VisualExplanation } from './tips-data';

const BUCKET_NAME = 'formula-visuals';

// This function converts the flat data structure from Supabase
// into the nested object structure our application uses.
const fromSupabase = (row: any): Tip => {
    if (!row) return {} as Tip;
    return {
        id: row.id,
        created_at: row.created_at,
        title: { en: row.title_en, my: row.title_my },
        oldMethodTitle: { en: row.old_method_title_en, my: row.old_method_title_my },
        oldMethodDesc: { en: row.old_method_desc_en || [], my: row.old_method_desc_my || [] },
        newMethodTitle: { en: row.new_method_title_en, my: row.new_method_title_my },
        newMethodDesc: { en: row.new_method_desc_en || [], my: row.new_method_desc_my || [] },
        details: { en: row.details_en || [], my: row.details_my || [] },
        exampleCode: row.example_code,
        visualExplanation: { imageUrl: row.image_url || '' },
    };
};

// This function converts our application's nested data structure
// into the flat structure Supabase uses.
const toSupabase = (tip: Partial<Omit<Tip, 'created_at' | 'id'>>) => {
    const row: { [key: string]: any } = {};

    if (tip.title) {
        row.title_en = tip.title.en;
        row.title_my = tip.title.my;
    }
    if (tip.oldMethodTitle) {
        row.old_method_title_en = tip.oldMethodTitle.en;
        row.old_method_title_my = tip.oldMethodTitle.my;
    }
    if (tip.oldMethodDesc) {
        row.old_method_desc_en = tip.oldMethodDesc.en;
        row.old_method_desc_my = tip.oldMethodDesc.my;
    }
    if (tip.newMethodTitle) {
        row.new_method_title_en = tip.newMethodTitle.en;
        row.new_method_title_my = tip.newMethodTitle.my;
    }
     if (tip.newMethodDesc) {
        row.new_method_desc_en = tip.newMethodDesc.en;
        row.new_method_desc_my = tip.newMethodDesc.my;
    }
    if (tip.details) {
        row.details_en = tip.details.en;
        row.details_my = tip.details.my;
    }
    if (tip.exampleCode) row.example_code = tip.exampleCode;

    if (Object.prototype.hasOwnProperty.call(tip, 'visualExplanation')) {
        row.image_url = tip.visualExplanation?.imageUrl || null;
    }

    return row;
};

const uploadImage = async (file: File, tipId: number | string): Promise<VisualExplanation> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `tip-${tipId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file);

    if (uploadError) {
        console.error("Error uploading image: ", uploadError);
        throw new Error(`Image upload failed: ${uploadError.message}`);
    }
    
    const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

    return {
        imageUrl: publicUrlData.publicUrl,
    };
};

const deleteImage = async (imageUrl: string) => {
    if (!imageUrl) return;
    try {
        const url = new URL(imageUrl);
        const filePath = url.pathname.split(`/${BUCKET_NAME}/`)[1];
        if (filePath) {
            const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
            if (error) {
                console.error("Failed to delete image from storage:", error.message);
            }
        }
    } catch (e) {
        console.error("Invalid image URL, cannot delete from storage:", imageUrl, e);
    }
}

export const addTip = async (tip: Omit<Tip, 'created_at' | 'id'>, file: File | null): Promise<Tip> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }
    
    const initialRowData = toSupabase(tip);
    delete initialRowData.image_url;
    
    const { data: insertedData, error: insertError } = await supabase
        .from('tips')
        .insert(initialRowData)
        .select()
        .single();

    if (insertError || !insertedData) {
        throw new Error(`Could not create tip: ${insertError?.message}`);
    }

    if (file) {
        const visualExplanation = await uploadImage(file, insertedData.id);
        
        const { data: updatedData, error: updateError } = await supabase
            .from('tips')
            .update({ image_url: visualExplanation.imageUrl })
            .eq('id', insertedData.id)
            .select()
            .single();

        if (updateError || !updatedData) {
            await deleteImage(visualExplanation.imageUrl);
            throw new Error(`Failed to update tip with image details: ${updateError?.message}`);
        }
        return fromSupabase(updatedData);
    }

    return fromSupabase(insertedData);
}

export const updateTip = async (id: number, tipUpdate: Partial<Omit<Tip, 'created_at'>>, file: File | null): Promise<Tip> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }

    const { data: currentTip, error: fetchError } = await supabase
        .from('tips')
        .select('image_url')
        .eq('id', id)
        .single();
    
    if (fetchError) {
        throw new Error("Could not retrieve current tip to update.");
    }

    const oldImageUrl = currentTip?.image_url;
    let updateData = toSupabase(tipUpdate);

    if (file) {
        if (oldImageUrl) {
            await deleteImage(oldImageUrl);
        }
        const visualExplanation = await uploadImage(file, id);
        updateData.image_url = visualExplanation.imageUrl;
    } 
    else if (tipUpdate.visualExplanation && !tipUpdate.visualExplanation.imageUrl && oldImageUrl) {
        await deleteImage(oldImageUrl);
        updateData.image_url = null;
    }

    const { data, error } = await supabase
        .from('tips')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return fromSupabase(data);
}

export const deleteTip = async (id: number): Promise<void> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }
    
    const { data: tipData, error: fetchError } = await supabase
        .from('tips')
        .select('image_url')
        .eq('id', id)
        .single();
    
    if (!fetchError && tipData?.image_url) {
        await deleteImage(tipData.image_url);
    }
    
    const { error: deleteError } = await supabase
        .from('tips')
        .delete()
        .eq('id', id);

    if (deleteError) {
        throw new Error(`Failed to delete tip record: ${deleteError.message}`);
    }
}
