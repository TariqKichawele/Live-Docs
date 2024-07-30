'use client';

import { ClientSideSuspense, RoomProvider } from '@liveblocks/react/suspense'
import Header from '@/components/Header'
import { Editor } from '@/components/editor/Editor'
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import React, { useEffect, useRef, useState } from 'react'
import ActiveCollaborators from './ActiveCollaborators';
import { Input } from './ui/input';
import Image from 'next/image';
import { updateDocument } from '@/lib/actions/roomActions';
import Loader from './Loader';
import ShareModal from './ShareModal';

const CollaborativeRoom = ({ roomId, roomMetadata, users, currentUserType }: CollaborativeRoomProps) => { // replace with current user type

    const [ isEditing, setIsEditing ] = useState(false);
    const [ loading, setLoading ] = useState(false);
    const [ documentTitle, setDocumentTitle ] = useState(roomMetadata.title);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const updateTitleHandler = async (e: React.KeyboardEvent<HTMLInputElement>) => {
        if(e.key === 'Enter') {
            setLoading(true);

            try {
                if(documentTitle !== roomMetadata.title) {
                    const updatedDocument = await updateDocument(roomId, documentTitle);

                    if(updatedDocument) {
                        setIsEditing(false);
                    }
                } 
            } catch (error) {
                console.error(error);
            }

            setLoading(false);
        }
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if(containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsEditing(false);
                updateDocument(roomId, documentTitle)
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [])

    useEffect(() => {
        if(isEditing && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isEditing])

  return (
    <RoomProvider id={roomId}>
        <ClientSideSuspense fallback={<Loader />}>
            <div className="collaborative-room">
            <Header>
                <div ref={containerRef} className='flex w-fit items-center justify-center gap-2'>
                    {isEditing && !loading ? (
                        <Input 
                            type='text'
                            value={documentTitle}
                            ref={inputRef}
                            placeholder='Enter title'
                            onChange={(e) => setDocumentTitle(e.target.value)}
                            onKeyDown={updateTitleHandler}
                            disabled={!isEditing}
                            className='document-title-input'
                        />
                    ) : (
                        <>
                            <p className='document-title'>{documentTitle}</p>
                        </>
                    )}

                    {currentUserType === 'editor' && !isEditing && (
                        <Image 
                            src={"/assets/icons/edit.svg"}
                            alt="edit"
                            width={24}
                            height={24}
                            onClick={() => setIsEditing(true)}
                            className='pointer'
                        />
                    )}

                    {currentUserType !== 'editor' && !isEditing && (
                        <p className='view-only-tag'>View only</p>
                    )}

                    {loading && <p className='text-sm text-gray-400'>Saving...</p>}
                </div>
                <div className='flex w-full flex-1 justify-end gap-2 sm:gap-3 '>
                    <ActiveCollaborators />
                    <ShareModal 
                        roomId={roomId} 
                        collaborators={users} 
                        creatorId={roomMetadata.creatorId}
                        currentUserType={currentUserType} 
                    />
                    <SignedOut>
                        <SignInButton />
                    </SignedOut>
                    <SignedIn>
                        <UserButton />
                    </SignedIn>
                </div>
            </Header>
            <Editor roomId={roomId} currentUserType={currentUserType} />
            </div>
        </ClientSideSuspense>
    </RoomProvider>
  )
}

export default CollaborativeRoom