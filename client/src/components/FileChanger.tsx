import { ChevronsUpDown, FileText, Text } from 'lucide-react'
import React from 'react'
import { Badge } from './ui/badge'

function FileChanger({ resume }: { resume: boolean }) {
    return (
        <div className="text-lg font-semibold flex items-center gap-2 cursor-pointer">

            <div className='flex items-center gap-2'>

                {resume ? <FileText className="h-5 w-5" /> : <Text className="h-5 w-5" />}
                {resume ? 'Resume Preview' : 'Job Description Preview'}
                <ChevronsUpDown  size={20} />
            </div>

            <Badge variant="outline" className="ml-auto">
                PDF
            </Badge>
        </div>

    )
}

export default FileChanger