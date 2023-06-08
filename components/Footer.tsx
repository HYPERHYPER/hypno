export const Footer = () => {
    return (
        <footer className="text-center block static pb-4 lg:pb-0 lg:fixed lg:bottom-[35px] lg:right-[60px]">
            <div className="lowercase flex flex-row gap-3 text-grey items-baseline justify-center lg:justify-end lg:text-lg lg:gap-8">
                <span>© hypno 2023</span>
                <a href="https://hypno.com/privacy" target='_blank' rel="noreferrer">terms</a>
            </div>
        </footer>
    )
}