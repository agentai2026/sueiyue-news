import type { FixedColumnID } from "@shared/types"
import { useTitle } from "react-use"
import { NavBar } from "../navbar"
import { Dnd } from "./dnd"
import { currentColumnIDAtom } from "~/atoms"

export function Column({ id }: { id: FixedColumnID }) {
  const [currentColumnID, setCurrentColumnID] = useAtom(currentColumnIDAtom)
  useEffect(() => {
    setCurrentColumnID(id)
  }, [id, setCurrentColumnID])

  useTitle(`岁月实时新闻 | ${metadata[id].name}`)

  return (
    <>
      <div className="flex justify-center md:hidden mb-5">
        <NavBar />
      </div>
      {id === currentColumnID && <Dnd />}
    </>
  )
}
