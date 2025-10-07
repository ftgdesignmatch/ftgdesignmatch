-- Create project management system with client approval workflow

-- Create projects table
CREATE TABLE IF NOT EXISTS public.projects_2025_10_04_12_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    designer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    budget decimal(10,2),
    status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'pending_approval', 'revision_requested', 'completed', 'cancelled')),
    category text,
    skills_required text[],
    deadline timestamp with time zone,
    created_at timestamp with time zone DEFAULT NOW(),
    updated_at timestamp with time zone DEFAULT NOW(),
    started_at timestamp with time zone,
    completed_at timestamp with time zone,
    completion_notes text,
    client_rating integer CHECK (client_rating >= 1 AND client_rating <= 5),
    designer_rating integer CHECK (designer_rating >= 1 AND designer_rating <= 5),
    client_feedback text,
    designer_feedback text
);

-- Create project deliverables table
CREATE TABLE IF NOT EXISTS public.project_deliverables_2025_10_04_12_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects_2025_10_04_12_00(id) ON DELETE CASCADE,
    title text NOT NULL,
    description text,
    file_name text NOT NULL,
    file_url text NOT NULL,
    file_type text,
    file_size bigint,
    is_final_deliverable boolean DEFAULT false,
    is_watermarked boolean DEFAULT true,
    uploaded_by uuid REFERENCES auth.users(id),
    uploaded_at timestamp with time zone DEFAULT NOW(),
    client_approved boolean DEFAULT false,
    approved_at timestamp with time zone,
    revision_notes text,
    version_number integer DEFAULT 1
);

-- Create project status history table
CREATE TABLE IF NOT EXISTS public.project_status_history_2025_10_04_12_00 (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id uuid REFERENCES public.projects_2025_10_04_12_00(id) ON DELETE CASCADE,
    old_status text,
    new_status text NOT NULL,
    changed_by uuid REFERENCES auth.users(id),
    changed_at timestamp with time zone DEFAULT NOW(),
    notes text
);

-- Function to submit deliverable for approval
CREATE OR REPLACE FUNCTION public.submit_deliverable_for_approval(
    project_uuid uuid,
    deliverable_title text,
    deliverable_description text DEFAULT NULL,
    file_name text,
    file_url text,
    file_type text DEFAULT NULL,
    is_final boolean DEFAULT false
)
RETURNS json AS $$
DECLARE
    deliverable_id uuid;
    result json;
BEGIN
    -- Check if user is the designer for this project
    IF NOT EXISTS (
        SELECT 1 FROM public.projects_2025_10_04_12_00 
        WHERE id = project_uuid AND designer_id = auth.uid()
    ) THEN
        RETURN json_build_object('error', 'Only the assigned designer can submit deliverables');
    END IF;
    
    -- Insert deliverable
    INSERT INTO public.project_deliverables_2025_10_04_12_00 (
        project_id, title, description, file_name, file_url, file_type, 
        is_final_deliverable, uploaded_by
    ) VALUES (
        project_uuid, deliverable_title, deliverable_description, file_name, 
        file_url, file_type, is_final, auth.uid()
    ) RETURNING id INTO deliverable_id;
    
    -- Update project status to pending approval
    UPDATE public.projects_2025_10_04_12_00 
    SET 
        status = 'pending_approval',
        updated_at = NOW()
    WHERE id = project_uuid;
    
    -- Log status change
    INSERT INTO public.project_status_history_2025_10_04_12_00 (
        project_id, old_status, new_status, changed_by, notes
    ) SELECT 
        project_uuid, 
        (SELECT status FROM public.projects_2025_10_04_12_00 WHERE id = project_uuid),
        'pending_approval', 
        auth.uid(), 
        'Deliverable submitted: ' || deliverable_title;
    
    RETURN json_build_object(
        'success', true,
        'deliverable_id', deliverable_id,
        'message', 'Deliverable submitted for client approval'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function for client to approve/reject deliverable
CREATE OR REPLACE FUNCTION public.review_deliverable(
    deliverable_uuid uuid,
    approved boolean,
    revision_notes text DEFAULT NULL
)
RETURNS json AS $$
DECLARE
    project_record public.projects_2025_10_04_12_00%ROWTYPE;
    deliverable_record public.project_deliverables_2025_10_04_12_00%ROWTYPE;
    all_approved boolean;
    result json;
BEGIN
    -- Get deliverable info
    SELECT * INTO deliverable_record 
    FROM public.project_deliverables_2025_10_04_12_00 
    WHERE id = deliverable_uuid;
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Deliverable not found');
    END IF;
    
    -- Get project info and check if user is the client
    SELECT * INTO project_record 
    FROM public.projects_2025_10_04_12_00 
    WHERE id = deliverable_record.project_id AND client_id = auth.uid();
    
    IF NOT FOUND THEN
        RETURN json_build_object('error', 'Only the client can review deliverables');
    END IF;
    
    -- Update deliverable approval status
    UPDATE public.project_deliverables_2025_10_04_12_00 
    SET 
        client_approved = approved,
        approved_at = CASE WHEN approved THEN NOW() ELSE NULL END,
        revision_notes = revision_notes
    WHERE id = deliverable_uuid;
    
    IF approved THEN
        -- Check if all final deliverables are approved
        SELECT NOT EXISTS (
            SELECT 1 FROM public.project_deliverables_2025_10_04_12_00 
            WHERE project_id = project_record.id 
            AND is_final_deliverable = true 
            AND client_approved = false
        ) INTO all_approved;
        
        -- If all final deliverables approved, complete the project
        IF all_approved AND EXISTS (
            SELECT 1 FROM public.project_deliverables_2025_10_04_12_00 
            WHERE project_id = project_record.id AND is_final_deliverable = true
        ) THEN
            -- Complete the project
            UPDATE public.projects_2025_10_04_12_00 
            SET 
                status = 'completed',
                completed_at = NOW(),
                updated_at = NOW()
            WHERE id = project_record.id;
            
            -- Remove watermarks from all deliverables
            UPDATE public.project_deliverables_2025_10_04_12_00 
            SET is_watermarked = false 
            WHERE project_id = project_record.id;
            
            -- Log completion
            INSERT INTO public.project_status_history_2025_10_04_12_00 (
                project_id, old_status, new_status, changed_by, notes
            ) VALUES (
                project_record.id, 'pending_approval', 'completed', auth.uid(), 
                'All final deliverables approved - project completed'
            );
            
            RETURN json_build_object(
                'success', true,
                'project_completed', true,
                'message', 'Deliverable approved and project completed! Watermarks removed.'
            );
        ELSE
            -- Just approve this deliverable
            UPDATE public.projects_2025_10_04_12_00 
            SET 
                status = 'in_progress',
                updated_at = NOW()
            WHERE id = project_record.id;
            
            RETURN json_build_object(
                'success', true,
                'project_completed', false,
                'message', 'Deliverable approved'
            );
        END IF;
    ELSE
        -- Revision requested
        UPDATE public.projects_2025_10_04_12_00 
        SET 
            status = 'revision_requested',
            updated_at = NOW()
        WHERE id = project_record.id;
        
        -- Log revision request
        INSERT INTO public.project_status_history_2025_10_04_12_00 (
            project_id, old_status, new_status, changed_by, notes
        ) VALUES (
            project_record.id, 'pending_approval', 'revision_requested', auth.uid(), 
            'Revision requested: ' || COALESCE(revision_notes, 'No notes provided')
        );
        
        RETURN json_build_object(
            'success', true,
            'revision_requested', true,
            'message', 'Revision requested'
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;