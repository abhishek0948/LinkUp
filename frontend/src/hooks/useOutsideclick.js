import { useEffect } from "react";

const useOutsideclick = (ref,callback) => {
    useEffect(() => {
        const handleoutsideclick = (e) => {
            if(ref.current && !ref.current.contains(e.target)) {
                callback()
            }
        }

        document.addEventListener("mousedown", handleoutsideclick);

        return () => {
            document.removeEventListener("mousedown",handleoutsideclick);
        }
    },[ref,callback])
}

export default useOutsideclick;