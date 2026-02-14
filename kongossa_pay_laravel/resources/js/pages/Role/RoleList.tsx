import { Breadcrumbs, Button, ConfirmationDialog, useToast } from '@/components';
import InputError from '@/components/input-error';
import { Checkbox } from "@/components/ui/checkbox";
import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { PaginatedData, Role } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function RoleList({ roles, permissions }: { roles: PaginatedData<Role>, permissions: string[] }) {
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [editingRole, setEditingRole] = useState<Role | null>(null);
   const { toast } = useToast();
   const { post, processing, errors, reset, setData, data } = useForm({
      name: "",
      permissions: [] as string[],
   });


   const { put: editPost, errors: editErrors, processing: editProcessing, reset: editReset, setData: setEditData, data: editData } = useForm({
      name: "",
      permissions: [] as string[],
   });

   const handleSubmit = (e: any) => {
      e.preventDefault();
      post(route('roles.store'), {
         preserveState: true,
         onSuccess: () => {
            setIsModalOpen(false);
            reset();
            toast({
               title: 'Successfully Created!',
               description: "You have successfully created a new Role",
            });
         }
      });
   };

   const handleEdit = (role: Role) => {
      setEditingRole(role);
      setEditData({
         name: role.name,
         permissions: role.permissions.map(p => p.name)
      });
      setIsEditModalOpen(true);
   };

   const handleEditSubmit = (e: any) => {
      e.preventDefault();
      if (!editingRole) return;

      editPost(route('roles.update', editingRole.id), {
         preserveState: true,
         onSuccess: () => {
            setIsEditModalOpen(false);
            editReset();
            setEditingRole(null);
         },
         onError(errors) {
            setIsEditModalOpen(false);
            editReset();
            setEditingRole(null);
            toast({
               title: 'Error',
               description: errors.error,
            });
         }
      });
   };

   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
   const [deleteProcessing, setDeleteProcessing] = useState(false);
   const [deleteRoleId, setDeleteRoleId] = useState<null | number>(null)
   const handleDeleteRole = () => {
      setIsDeleteModalOpen(false);
      setDeleteProcessing(true);
      router.delete(route('roles.destroy', { role: deleteRoleId }), {
         preserveState: true,
         onSuccess: () => {
            setDeleteProcessing(false);
            setDeleteRoleId(null);
         },
         onError(errors) {
            setDeleteProcessing(false);
            setDeleteRoleId(null);
            toast({
               title: 'Error',
               description: errors.error,
            });
         }
      });
   };

   const breadcrumbs = [
      { label: 'Dashboard', href: route('dashboard') },
      { label: 'Roles', href: "#" },
   ];

   return (
      <>
         <Head title="Roles" />
         {breadcrumbs && <Breadcrumbs breadcrumbs={breadcrumbs} />}

         <div className="py-6">
            <div className="max-w-full mx-auto sm:px-6 lg:px-8 space-y-6">
               <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold tracking-tight dark:text-white">Roles</h2>
                  <Button onClick={() => setIsModalOpen(true)}>Add New Role</Button>
               </div>

               <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm sm:rounded-lg">
                  <div className="p-6">
                     <Table className="dark:text-gray-100">
                        <TableHeader>
                           <TableRow className="bg-muted/50 dark:bg-gray-700">
                              <TableHead className="w-[20%] dark:text-gray-200">Name</TableHead>
                              <TableHead className="w-[20%] dark:text-gray-200">Total User</TableHead>
                              <TableHead className="w-[80%] dark:text-gray-200">Permissions</TableHead>
                              <TableHead className="dark:text-gray-200">Actions</TableHead>
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           {roles.data.length === 0 ? (
                              <TableRow>
                                 <TableCell colSpan={2} className="text-center text-muted-foreground dark:text-gray-400">
                                    No roles found
                                 </TableCell>
                              </TableRow>
                           ) : (
                              roles.data.map((role) => (
                                 <TableRow key={role.id} className="dark:border-gray-700">
                                    <TableCell className="font-medium dark:text-gray-200">{role.name}</TableCell>
                                    <TableCell className="font-medium dark:text-gray-200">{role.total_users}</TableCell>
                                    <TableCell className="font-medium dark:text-gray-200">
                                       <div className="flex flex-wrap gap-1">
                                          {role.permissions.map(permission => (
                                             <span
                                                key={permission.id}
                                                className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                             >
                                                {permission.name}
                                             </span>
                                          ))}
                                       </div>
                                    </TableCell>
                                    <TableCell>
                                       <div className="flex items-center gap-2">
                                          <Button variant="outline" disabled={role.id === 1} size="sm" onClick={() => handleEdit(role)}
                                             className="dark:text-gray-200 dark:hover:text-gray-100">Edit</Button>
                                          <Button variant="destructive" disabled={role.id === 1 || role.id === 2} onClick={() => {
                                             setIsDeleteModalOpen(true)
                                             setDeleteRoleId(role.id)
                                          }} size="sm">Delete</Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))
                           )}
                        </TableBody>
                     </Table>
                  </div>
               </div>
            </div>
         </div>
         {/* for creating */}
         <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-gray-100">
               <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">Add New Role</DialogTitle>
               </DialogHeader>
               <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="name">Role Name</Label>
                     <Input
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={e => setData('name', e.target.value)}
                        placeholder="Enter role name"
                        required
                     />
                     <InputError message={errors.name} />
                  </div>

                  <div className="space-y-2">
                     <Label>Permissions</Label>
                     <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                        {permissions.map((permission) => (
                           <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                 id={permission}
                                 checked={data.permissions.includes(permission)}
                                 onCheckedChange={(checked) => {
                                    const newPermissions = checked
                                       ? [...data.permissions, permission]
                                       : data.permissions.filter(p => p !== permission);
                                    setData('permissions', newPermissions);
                                 }}
                              />
                              <Label htmlFor={permission} className="text-sm">
                                 {permission}
                              </Label>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex justify-end gap-2">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsModalOpen(false)}
                     >
                        Cancel
                     </Button>
                     <Button type="submit" disabled={processing}>
                        {processing ? 'Creating...' : 'Create Role'}
                     </Button>
                  </div>
               </form>
            </DialogContent>
         </Dialog>

         {/* for editing */}
         <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
            <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-gray-100">
               <DialogHeader>
                  <DialogTitle className="dark:text-gray-100">Edit Role</DialogTitle>
               </DialogHeader>
               <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div className="space-y-2">
                     <Label htmlFor="edit-name">Role Name</Label>
                     <Input
                        id="edit-name"
                        type="text"
                        value={editData.name}
                        onChange={e => setEditData('name', e.target.value)}
                        placeholder="Enter role name"
                        required
                     />
                     <InputError message={editErrors.name} />
                  </div>

                  <div className="space-y-2">
                     <Label>Permissions</Label>
                     <div className="grid grid-cols-2 gap-2 max-h-[200px] overflow-y-auto">
                        {permissions.map((permission) => (
                           <div key={permission} className="flex items-center space-x-2">
                              <Checkbox
                                 id={`edit-${permission}`}
                                 checked={editData.permissions.includes(permission)}
                                 onCheckedChange={(checked) => {
                                    const newPermissions = checked
                                       ? [...editData.permissions, permission]
                                       : editData.permissions.filter(p => p !== permission);
                                    setEditData('permissions', newPermissions);
                                 }}
                              />
                              <Label htmlFor={`edit-${permission}`} className="text-sm">
                                 {permission}
                              </Label>
                           </div>
                        ))}
                     </div>
                  </div>

                  <div className="flex justify-end gap-2">
                     <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                           setIsEditModalOpen(false);
                           editReset();
                           setEditingRole(null);
                        }}
                     >
                        Cancel
                     </Button>
                     <Button type="submit" disabled={editProcessing}>
                        {editProcessing ? 'Saving...' : 'Save Changes'}
                     </Button>
                  </div>
               </form>
            </DialogContent>
         </Dialog>

         {/* Delete confirmation */}
         <ConfirmationDialog
            onOpenChange={setIsDeleteModalOpen}
            title='Delete Role'
            description='Are you sure you want to delete this role? This action cannot be undone.'
            open={isDeleteModalOpen}
            onConfirm={() => handleDeleteRole()}
            confirmText="Delete Role"
            cancelText='Cancel'
         />
      </>
   );
}
