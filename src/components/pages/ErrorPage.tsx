import Button from "../inputs/Button";
import NewProjectButton from "../layouts/NewProjectButton";
import { LuRefreshCw } from "react-icons/lu";

export default function ErrorPage() {
    // const error = useRouteError();

    return (
        <div
            className="p-4 grid justify-center my-32 flex-1">
            <div
                className="flex flex-col">
                <h2
                    className="mb-4">
                    <div className="text-5xl font-semibold mb-2">Oops!</div>
                    <div className="text-xl">Error occured</div>
                </h2>

                <p
                    className="text-on-surface-muted mb-8">
                    Try to reload the application or use a different dataset
                </p>

                <div
                    className="flex gap-3">
                    <Button
                        to="/"
                        reloadDocument
                        variant="primary">
                        <LuRefreshCw />
                        Reload
                    </Button>
                    <NewProjectButton />
                </div>
            </div>
        </div>
    );
}