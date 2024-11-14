import React, {useEffect, useRef, useState} from 'react';
import { useParams } from 'react-router-dom';
import AxiosInstance from '../../utils/AxiosInstance';
import BannerEdit from '../../components/community/admin/BannerEdit';
import { TagInput } from '../../components/TagInput';
import SuccessAlert from '../../components/SuccessAlert';
import ErrorAlert from '../../components/ErrorAlert';
import Loading from '../../components/Loading'

function CommunitySettings() {
    const { community_id } = useParams();
    const [communityDetails, setCommunityDetails] = useState<any>('');
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const [success, setSuccess] = useState(null);
    const [error, setError] = useState('');
    const [imageSrc, setImageSrc] = useState<any>(null);
    const [tags, setTags] = useState<string[]>([]);
    const [onUpdate, setOnUpdate] = useState(false);
    const [loading, setLoading]= useState(false)
    const dialogRef = useRef(null);

    useEffect(() => {
        const fetchCommunityDetails = async () => {
            try {
                const response = await AxiosInstance.get(`/api/community/${community_id}/`, {
                    withCredentials: true,
                });
                setCommunityDetails(response.data);
                setTags(response.data.keyword || []);
            } catch (error) {
                setError(`Error fetching community details: ${error.message}`);
            }
        };

        fetchCommunityDetails();
    }, [community_id, onUpdate, updateTrigger]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = {
                name: communityDetails.name,
                description: communityDetails.description,
                rules: communityDetails.rules,
                keyword: tags,
                imgURL: communityDetails.imgURL,
                bannerURL: communityDetails.bannerURL,
            };

            const response = await AxiosInstance.put(`/api/community/update/${community_id}/`, formData, {
                withCredentials: true,
            });
            console.log(response.data);

            setCommunityDetails(response.data);
            setSuccess('Community details updated successfully');
            setOnUpdate(true)
        } catch (error) {
            console.error('Error updating community details:', error);
            setError(`Error updating community details: ${error.message}`)
        }finally {
            setLoading(false);
            document.getElementById('loading').close()
        }
    };

    useEffect(() => {
        const dialog = dialogRef.current;
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                event.stopPropagation();
            }
        };

        if (dialog) {
            dialog.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            if (dialog) {
                dialog.removeEventListener('keydown', handleKeyDown);
            }
        };
    }, []);

    useEffect(() => {
        if(loading){
            document.getElementById('loading').showModal()
            console.log(loading)
        }
    }, [loading]);

    const triggerUpdate = () => {
        setUpdateTrigger(prev => prev + 1);
    };

    return (
        <div className="min-h-screen bg-base-100">
            {error && <ErrorAlert text={error}/>}
            {success && <SuccessAlert text={success}/>}
            <dialog
                ref={dialogRef}
                id="loading"
                className="modal modal-bottom sm:modal-middle"
                onClose={(e) => e.preventDefault()}
                onCancel={(e) => e.preventDefault()}
            >
                <form method="dialog" className="modal-box" onSubmit={(e) => e.preventDefault()}>
                    <Loading loadingText="Please wait..."/>
                </form>
            </dialog>


            <header className="bg-base-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold">{communityDetails.name} - Settings</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl rounded rounded-lg bg-base-200 my-5 mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="border rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col">
                        <h2 className="text-xl font-semibold">Community Overview</h2>

                        <BannerEdit
                            communityName={communityDetails?.name}
                            commBanner={communityDetails?.bannerURL}
                            commAvatar={communityDetails?.imgURL}
                            communityID={communityDetails?.id}
                            communityPrivacy={communityDetails?.privacy}
                            onUpdate={triggerUpdate}
                        />

                        <div className="mt-3">
                            <form onSubmit={handleSave}>
                                <label className="label">
                                    <span className="label-text">Community Description</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    value={communityDetails.description}
                                    onChange={(e) => setCommunityDetails({
                                        ...communityDetails,
                                        description: e.target.value
                                    })}
                                />
                                <button type="submit" className="btn btn-primary m-2">
                                    Save
                                </button>
                            </form>
                        </div>

                        <div className="mt-3">
                            <form onSubmit={handleSave}>
                                <label className="label">
                                    <span className="label-text">Community Rules</span>
                                </label>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    value={communityDetails.rules}
                                    onChange={(e) => setCommunityDetails({...communityDetails, rules: e.target.value})}
                                />
                                <button type="submit" className="btn btn-primary m-2">
                                    Save
                                </button>
                            </form>
                        </div>

                        <div className="mt-3">
                            <label className="label">
                                <span className="label-text">Community Tags</span>
                            </label>

                            <form onSubmit={handleSave}>
                                <TagInput
                                    value={tags}
                                    onChange={setTags}
                                    placeholder="Add tags (e.g., 'react', 'typescript')..."
                                />
                                <button type="submit" className="btn btn-primary m-2" onSubmit={handleSave}>
                                    Save
                                </button>
                            </form>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}

export default CommunitySettings;
