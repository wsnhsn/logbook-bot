declare module 'lucide-react' {
  import { FC, SVGAttributes } from 'react'
  
  export interface IconProps extends SVGAttributes<SVGElement> {
    color?: string
    size?: string | number
  }

  export const Upload: FC<IconProps>
  export const FileText: FC<IconProps>
  export const Download: FC<IconProps>
  export const PlayCircle: FC<IconProps>
  export const CheckCircle: FC<IconProps>
  export const XCircle: FC<IconProps>
  export const AlertCircle: FC<IconProps>
  export const BookOpen: FC<IconProps>
  export const Chrome: FC<IconProps>
}
