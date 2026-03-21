export default function SocialButton({icon, href}){

    return (
        <div>
            <a href={href}>
              {icon}
            </a>
        </div>
    )
}