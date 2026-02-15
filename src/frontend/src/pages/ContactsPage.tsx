import { useState } from 'react';
import { Users, Plus, Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEmergencyContacts } from '../features/contacts/contactsStore';
import { toast } from 'sonner';

export default function ContactsPage() {
  const { contacts, addContact, updateContact, removeContact, isLoading } = useEmergencyContacts();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    contactInfo: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactInfo) {
      toast.error('Name and contact info are required');
      return;
    }

    setIsSaving(true);
    try {
      if (editingContact) {
        await updateContact({ ...editingContact, ...formData });
        toast.success('Contact updated');
      } else {
        await addContact(formData);
        toast.success('Contact added');
      }

      setIsDialogOpen(false);
      setEditingContact(null);
      setFormData({ name: '', relationship: '', contactInfo: '' });
    } catch (error: any) {
      toast.error(error.message || 'Failed to save contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      relationship: contact.relationship,
      contactInfo: contact.contactInfo,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: bigint) => {
    if (!confirm('Are you sure you want to remove this contact?')) return;

    try {
      await removeContact(id);
      toast.success('Contact removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove contact');
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingContact(null);
      setFormData({ name: '', relationship: '', contactInfo: '' });
    }
  };

  return (
    <div className="container max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <Users className="h-8 w-8 text-destructive" />
            Emergency Contacts
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage contacts who will receive your SOS status link
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={handleDialogChange}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>{editingContact ? 'Edit Contact' : 'Add Emergency Contact'}</DialogTitle>
                <DialogDescription>
                  Add someone who should be notified during emergencies
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship">Relationship</Label>
                  <Input
                    id="relationship"
                    value={formData.relationship}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="e.g., Spouse, Parent, Friend"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactInfo">Contact Info *</Label>
                  <Input
                    id="contactInfo"
                    value={formData.contactInfo}
                    onChange={(e) => setFormData({ ...formData, contactInfo: e.target.value })}
                    placeholder="Phone number or email"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogChange(false)} disabled={isSaving}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? 'Saving...' : editingContact ? 'Update' : 'Add'} Contact
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Emergency Contacts</CardTitle>
          <CardDescription>
            These contacts can receive your SOS status link manually
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading contacts...</p>
          ) : contacts.length === 0 ? (
            <Alert>
              <AlertDescription>
                No emergency contacts added yet. Add contacts who should be notified during emergencies.
              </AlertDescription>
            </Alert>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Relationship</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id.toString()}>
                    <TableCell className="font-medium">{contact.name}</TableCell>
                    <TableCell>{contact.relationship || '-'}</TableCell>
                    <TableCell>{contact.contactInfo}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(contact)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(contact.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
