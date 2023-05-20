import {Iubenda} from "./Iubenda";

export const Footer = ({t}) => {
    return <footer
        className="clear-both mt-2.5 text-center text-[#666] text-xs [&_a]:text-[#2971a7] [&_a]:hover:text-[#003e74]">
        <div dangerouslySetInnerHTML={{
            __html: t('admin.footer')
        }}/>
        <br/>
        <Iubenda/>
    </footer>;
}