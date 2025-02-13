export const shouldShowRedeemReferralModal = () => {
    return localStorage.getItem('mymcat_show_redeem_referral_modal') === 'true';
}; 