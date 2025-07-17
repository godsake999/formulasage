
import { supabase } from './supabaseClient';
import type { Formula, Example } from './data';

const BUCKET_NAME = 'formula-visuals';

// This function converts the flat data structure from Supabase
// into the nested object structure our application uses.
const fromSupabase = (row: any): Formula => {
  if (!row) return {} as Formula;
  const formula: Formula = {
    id: row.id,
    created_at: row.created_at,
    title: { en: row.title_en, my: row.title_my },
    category: { en: row.category_en, my: row.category_my },
    shortDescription: { en: row.short_description_en, my: row.short_description_my },
    longDescription: { en: row.long_description_en || [], my: row.long_description_my || [] },
    syntax: row.syntax,
    syntaxBreakdown: { en: row.syntax_breakdown_en || [], my: row.syntax_breakdown_my || [] },
    examples: row.examples || [], // This is now an array of {code, explanation, imageUrl}
    isNew: row.is_new,
    difficulty: { en: row.difficulty_en || 'Beginner', my: row.difficulty_my || 'လွယ်ကူသော' },
  };

  return formula;
};


// This function converts our application's nested data structure
// into the flat structure Supabase uses.
const toSupabase = (formula: Partial<Omit<Formula, 'created_at' | 'id'>>) => {
    const row: { [key: string]: any } = {};

    if (formula.title) {
        row.title_en = formula.title.en;
        row.title_my = formula.title.my;
    }
    if (formula.category) {
        row.category_en = formula.category.en;
        row.category_my = formula.category.my;
    }
    if (formula.shortDescription) {
        row.short_description_en = formula.shortDescription.en;
        row.short_description_my = formula.shortDescription.my;
    }
    if (formula.longDescription) {
        row.long_description_en = formula.longDescription.en;
        row.long_description_my = formula.longDescription.my;
    }
    if (formula.syntaxBreakdown) {
        row.syntax_breakdown_en = formula.syntaxBreakdown.en;
        row.syntax_breakdown_my = formula.syntaxBreakdown.my;
    }
    if (formula.syntax) row.syntax = formula.syntax;
    if (formula.examples) row.examples = formula.examples; // Direct mapping of the examples array to JSONB
     if (formula.difficulty) {
        row.difficulty_en = formula.difficulty.en;
        row.difficulty_my = formula.difficulty.my;
    }
    
    // handle boolean
    if (formula.isNew !== undefined) {
        row.is_new = formula.isNew;
    }
    
    // Remove old/deprecated fields
    delete row.image_url;
    delete row.visualExplanation;

    return row;
};

const uploadImage = async (file: File, formulaId: number | string, exampleIndex: number): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `formula-${formulaId}-ex${exampleIndex}-${Date.now()}.${fileExt}`;
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

    return publicUrlData.publicUrl;
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
                // Don't throw, just log the error. The record deletion is more important.
            }
        }
    } catch (e) {
        console.error("Invalid image URL, cannot delete from storage:", imageUrl, e);
    }
};

const processImagesForExamples = async (
    examples: Example[],
    files: (File | null)[],
    formulaId: number
): Promise<Example[]> => {
    const processedExamples = [...examples];

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file) {
            // If there's an old image for this example, delete it first
            if (processedExamples[i]?.imageUrl) {
                await deleteImage(processedExamples[i].imageUrl);
            }
            // Upload the new image and update the URL
            const newImageUrl = await uploadImage(file, formulaId, i);
            processedExamples[i].imageUrl = newImageUrl;
        } else if (processedExamples[i] && !processedExamples[i].imageUrl) {
            // This handles the case where an image was removed in the UI.
            // No file is passed, and the imageUrl on the example is already cleared.
            // We still need to check if there was a URL before the UI change
            // (this logic is better handled in the update function which has 'before' and 'after' states)
        }
    }

    return processedExamples;
};


export const addFormula = async (formula: Omit<Formula, 'created_at' | 'id'>, files: (File | null)[]): Promise<Formula> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }

    // Insert the formula record first to get an ID. Examples will be empty initially.
    const initialRowData = toSupabase({ ...formula, examples: [] });
    
    const { data: insertedData, error: insertError } = await supabase
        .from('formulas')
        .insert(initialRowData)
        .select()
        .single();

    if (insertError || !insertedData) {
        throw new Error(`Could not create formula: ${insertError?.message}`);
    }

    // Now, process images and get the final examples array
    const examplesWithImageUrls = await processImagesForExamples(formula.examples, files, insertedData.id);

    // Update the record with the examples array containing image URLs
    const { data: updatedData, error: updateError } = await supabase
        .from('formulas')
        .update({ examples: examplesWithImageUrls })
        .eq('id', insertedData.id)
        .select()
        .single();
    
    if (updateError || !updatedData) {
        // Attempt cleanup
        for (const example of examplesWithImageUrls) {
            if (example.imageUrl) await deleteImage(example.imageUrl);
        }
        throw new Error(`Failed to update formula with examples: ${updateError.message}`);
    }

    return fromSupabase(updatedData);
}

export const updateFormula = async (id: number, formulaUpdate: Partial<Omit<Formula, 'created_at'>>, files: (File | null)[]): Promise<Formula> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }

    // Get the current state of the formula from DB
    const { data: currentFormulaData, error: fetchError } = await supabase
        .from('formulas')
        .select('examples')
        .eq('id', id)
        .single();

    if (fetchError) throw new Error("Could not fetch current formula state for update.");

    const currentExamples: Example[] = currentFormulaData.examples || [];
    const newExamples: Example[] = formulaUpdate.examples || [];
    
    // Logic to delete images that are no longer present in the updated formula
    for(const currentExample of currentExamples) {
        if(currentExample.imageUrl) {
            const isStillPresent = newExamples.some(newEx => newEx.imageUrl === currentExample.imageUrl);
            if (!isStillPresent) {
                await deleteImage(currentExample.imageUrl);
            }
        }
    }
    
    // Process new/updated images
    const examplesWithImageUrls = await processImagesForExamples(newExamples, files, id);
    
    const updatePayload = toSupabase(formulaUpdate);
    updatePayload.examples = examplesWithImageUrls;

    const { data, error } = await supabase
        .from('formulas')
        .update(updatePayload)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }
    return fromSupabase(data);
}

export const deleteFormula = async (id: number): Promise<void> => {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData.session) {
        throw new Error("Not authenticated");
    }
    
    // First, fetch the record to get the examples and their image URLs.
    const { data: formulaData, error: fetchError } = await supabase
        .from('formulas')
        .select('examples')
        .eq('id', id)
        .single();
    
    // If the record exists and has examples with images, delete them from storage.
    if (!fetchError && formulaData?.examples) {
        for (const example of formulaData.examples) {
            if (example.imageUrl) {
                await deleteImage(example.imageUrl);
            }
        }
    }
    
    // Now, delete the record from the database.
    const { error: deleteError } = await supabase
        .from('formulas')
        .delete()
        .eq('id', id);

    if (deleteError) {
        throw new Error(`Failed to delete formula record: ${deleteError.message}`);
    }
}

    