import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { DialogHeader } from "../ui/dialog";

export const CreateProfileModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create your deResearcher profile</DialogTitle>
          <DialogDescription>
            A decentralized research platform on solana
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
