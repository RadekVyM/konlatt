import { LuDownload } from "react-icons/lu";
import Button from "../inputs/Button";
import { IconType } from "react-icons";

export default function DownloadButtons(props: {
    copyDisabled?: boolean,
    downloadDisabled?: boolean,
    copyButtonIcon: IconType,
    onCopyClick: () => void,
    onDownloadClick: () => void,
}) {
    const CopyIcon = props.copyButtonIcon;

    return (
        <>
            <Button
                variant="container"
                size="lg"
                className="w-full justify-center row-start-2"
                disabled={props.copyDisabled}
                onClick={props.onCopyClick}>
                <CopyIcon />
                Copy
            </Button>
            <Button
                variant="primary"
                size="lg"
                className="w-full justify-center row-start-2"
                disabled={props.downloadDisabled}
                onClick={props.onDownloadClick}>
                <LuDownload />
                Download
            </Button>
        </>
    );
}