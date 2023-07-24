import React, { createContext, useState, useContext, useEffect } from 'react';

interface UserPrivileges {
    canDownloadContent?: boolean;
    canDownloadData?: boolean;
    canShareEvent?: boolean;
    canEditEvent?: boolean;
    canArchiveEvent?: boolean;
    canRemoveActivator?: boolean;
    canAddActivator?: boolean;
    canModeratePhoto?: boolean;
    canArchivePhoto?: boolean;
    canLikePhoto?: boolean;
    canViewPayment?: boolean;
    canUpgradePayment?: boolean;
    canDowngradePayment?: boolean;
    canViewUsers?: boolean;
    canEditUsers?: boolean;
    canInviteMember?: boolean;
    canInviteAdmin?: boolean;
    canViewOrganization?: boolean;
    canEditOrganization?: boolean;
}

interface PrivilegeContextProps {
    userPrivileges: UserPrivileges;
    setUserPrivileges: React.Dispatch<React.SetStateAction<UserPrivileges>>;
}

const PrivilegeContext = createContext<PrivilegeContextProps>({
    userPrivileges: { 
        canDownloadContent: false,
        canDownloadData: false,
        canShareEvent: false,
        canEditEvent: false,
        canArchiveEvent: false,
        canRemoveActivator: false,
        canAddActivator: false,
        canModeratePhoto: false,
        canArchivePhoto: false,
        canLikePhoto: false,
        canViewPayment: false,
        canUpgradePayment: false,
        canDowngradePayment: false,
        canViewUsers: false,
        canEditUsers: false,
        canInviteMember: false,
        canInviteAdmin: false,
        canViewOrganization: false,
        canEditOrganization: false,
    },
    setUserPrivileges: () => { },
});

const PrivilegeProvider = ({ children, privileges } : any) => {
    const [userPrivileges, setUserPrivileges] = useState<UserPrivileges>({
        canDownloadContent: false,
        canDownloadData: false,
        canShareEvent: false,
        canEditEvent: false,
        canArchiveEvent: false,
        canRemoveActivator: false,
        canAddActivator: false,
        canModeratePhoto: false,
        canArchivePhoto: false,
        canLikePhoto: false,
        canViewPayment: false,
        canUpgradePayment: false,
        canDowngradePayment: false,
        canViewUsers: false,
        canEditUsers: false,
        canInviteMember: false,
        canInviteAdmin: false,
        canViewOrganization: false,
        canEditOrganization: false,
    });

    useEffect(() => {
        setUserPrivileges((prev) => ({...prev, ...privileges }))
    }, [privileges])

    return (
        <PrivilegeContext.Provider value={{ userPrivileges, setUserPrivileges }}>
            {children}
        </PrivilegeContext.Provider>
    );
};

export { PrivilegeContext, PrivilegeProvider };