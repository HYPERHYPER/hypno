import _ from "lodash";

export const getEventPrivileges =  (userPrivileges: { 
    download?: Privilege, 
    event?: Privilege, 
    photo_actions?: Privilege,
    activators?: Privilege,
}) => {
    const canDownloadContent = _.includes(userPrivileges?.download, 'content');
    const canDownloadData = _.includes(userPrivileges?.download, 'data');
    const canShareEvent = _.includes(userPrivileges?.event, 'share');
    const canEditEvent = _.includes(userPrivileges?.event, 'edit');
    const canArchiveEvent = _.includes(userPrivileges?.event, 'archive');
    const canRemoveActivator = _.includes(userPrivileges?.activators, 'remove');
    const canAddActivator = _.includes(userPrivileges?.activators, 'add');
    const canModeratePhoto = _.includes(userPrivileges?.photo_actions, 'moderate');
    const canArchivePhoto = _.includes(userPrivileges?.photo_actions, 'archive');
    const canLikePhoto = _.includes(userPrivileges?.photo_actions, 'like');

    return {
        canDownloadContent,
        canDownloadData,
        canShareEvent,
        canEditEvent,
        canArchiveEvent,
        canRemoveActivator,
        canAddActivator,
        canModeratePhoto,
        canArchivePhoto,
        canLikePhoto,
    }
}

export const getOrganizationPrivileges =  (userPrivileges: { 
    payment?: Privilege, 
    users?: Privilege, 
    invites?: Privilege,
    organization?: Privilege,
}) => {
    const canViewPayment = _.includes(userPrivileges?.payment, 'view');
    const canUpgradePayment = _.includes(userPrivileges?.payment, 'upgrade');
    const canDowngradePayment = _.includes(userPrivileges?.payment, 'downgrade');
    const canViewUsers = _.includes(userPrivileges?.users, 'view');
    const canEditUsers = _.includes(userPrivileges?.users, 'edit');
    const canInviteMember = _.includes(userPrivileges?.invites, 'memeber');
    const canInviteAdmin = _.includes(userPrivileges?.invites, 'admin');
    const canViewOrganization = _.includes(userPrivileges?.organization, 'view');
    const canEditOrganization = _.includes(userPrivileges?.organization, 'edit');

    return {
        canViewPayment,
        canUpgradePayment,
        canDowngradePayment,
        canViewUsers,
        canEditUsers,
        canInviteMember,
        canInviteAdmin,
        canViewOrganization,
        canEditOrganization,
    }
}